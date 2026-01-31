import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  RotateCcw,
  CheckSquare,
  StickyNote,
  Search,
  Trash,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as tasksApi from '@/lib/api/tasks';
import * as notesApi from '@/lib/api/notes';
import { Task, Note } from '@/types/api';

type TrashItem = { _id: string; title: string; deletedAt: string; type: 'task' | 'note'; color?: string };

function TrashItem({ item, onRestore, onDelete, isDeleting, isRestoring }: {
  item: TrashItem;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isRestoring?: boolean;
}) {
  const daysAgo = Math.floor((Date.now() - new Date(item.deletedAt).getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 30 - daysAgo);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
        (isDeleting || isRestoring) && "opacity-50 pointer-events-none"
      )}
      style={{
        backgroundColor: item.color ? `${item.color}33` : undefined, // 33 is ~20% opacity
        borderColor: item.color ? `${item.color}4D` : undefined, // 4D is ~30% opacity
      }}
    >
      <div className={cn(
        "p-2 rounded-lg",
        item.type === 'task' ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
      )}>
        {item.type === 'task' ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <StickyNote className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{item.title}</h3>
        <p className="text-xs text-muted-foreground">
          Deleted {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
          {daysRemaining > 0 && ` • ${daysRemaining}d remaining`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRestore(item._id)}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Restore
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(item._id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function TrashPage() {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'tasks' | 'notes'>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [emptyTrashConfirmOpen, setEmptyTrashConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [restoringItems, setRestoringItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    try {
      setLoading(true);
      const [tasks, notes] = await Promise.all([
        tasksApi.getTrashedTasks(),
        notesApi.getTrashedNotes(),
      ]);

      const formattedTasks: TrashItem[] = tasks.map((t) => ({
        _id: t._id,
        title: t.title,
        deletedAt: t.deletedAt || t.updatedAt || new Date().toISOString(),
        type: 'task',
        color: t.color, // Include color field
      }));

      const formattedNotes: TrashItem[] = notes.map((n) => ({
        _id: n._id,
        title: n.title,
        deletedAt: n.deletedAt || n.updatedAt || new Date().toISOString(),
        type: 'note',
        color: n.color, // Include color field
      }));

      setTrashItems([...formattedTasks, ...formattedNotes]);
    } catch (error) {
      console.error('Failed to load trash:', error);
      toast.error('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    const item = trashItems.find((t) => t._id === id);
    if (!item) return;

    setRestoringItems(prev => new Set(prev).add(id));

    try {
      if (item.type === 'task') {
        await tasksApi.restoreTask(id);
      } else {
        await notesApi.restoreNote(id);
      }
      
      setTrashItems((prev) => prev.filter((t) => t._id !== id));
      toast.success(`${item.type === 'task' ? 'Task' : 'Note'} restored successfully`);
    } catch (error) {
      console.error('Failed to restore item:', error);
      toast.error('Failed to restore item');
    } finally {
      setRestoringItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    const item = trashItems.find((t) => t._id === itemToDelete);
    if (!item) return;

    setDeleteConfirmOpen(false);
    setDeletingItems(prev => new Set(prev).add(itemToDelete));

    try {
      if (item.type === 'task') {
        await tasksApi.permanentlyDeleteTask(itemToDelete);
      } else {
        await notesApi.permanentlyDeleteNote(itemToDelete);
      }
      
      setTrashItems((prev) => prev.filter((t) => t._id !== itemToDelete));
      toast.success('Item permanently deleted');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeletingItems(prev => {
        const next = new Set(prev);
        next.delete(itemToDelete);
        return next;
      });
      setItemToDelete(null);
    }
  };

  const handleEmptyTrash = async () => {
    const itemsToDelete = [...trashItems];
    setEmptyTrashConfirmOpen(false);

    try {
      setLoading(true);
      
      await Promise.all(
        itemsToDelete.map(item => 
          item.type === 'task' 
            ? tasksApi.permanentlyDeleteTask(item._id) 
            : notesApi.permanentlyDeleteNote(item._id)
        )
      );
      
      setTrashItems([]);
      toast.success(`${itemsToDelete.length} items permanently deleted`);
    } catch (error) {
      console.error('Failed to empty trash:', error);
      toast.error('Failed to empty trash');
      loadTrash();
    } finally {
      setLoading(false);
    }
  };

  const allItems: TrashItem[] = trashItems.filter((item) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItems = allItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'tasks') return item.type === 'task';
    if (filter === 'notes') return item.type === 'note';
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Trash"
        description="Items are permanently deleted after 30 days"
        actions={
          allItems.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setEmptyTrashConfirmOpen(true)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
            </Button>
          )
        }
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2 text-xs">
                {allItems.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <TrashItem
                key={item._id}
                item={item}
                onRestore={handleRestore}
                onDelete={handleDeleteClick}
                isDeleting={deletingItems.has(item._id)}
                isRestoring={restoringItems.has(item._id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trash className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">
            {searchQuery || filter !== 'all' ? 'No items found' : 'Trash is empty'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Deleted items will appear here'
            }
          </p>
        </motion.div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={emptyTrashConfirmOpen} onOpenChange={setEmptyTrashConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {allItems.length} items in the trash. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              className="bg-destructive hover:bg-destructive/90"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
