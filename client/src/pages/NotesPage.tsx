import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Pin,
  Star,
  MoreHorizontal,
  Trash2,
  Edit,
  Grid,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import * as notesApi from '@/lib/api/notes';
import { toast } from 'sonner';
import { Note, NoteCreate, NoteUpdate } from '@/types/api';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { NoteViewDialog } from '@/components/notes/NoteViewDialog';

// Extend Note type for UI purposes (mock data has color)
interface UiNote extends Note {
  color?: string;
}

// Mock data
const mockNotes: Partial<UiNote>[] = [
  {
    _id: '1',
    title: 'Project Ideas',
    content: '# New Projects\n\n- Build a habit tracker\n- Create a note-taking app\n- Design a team collaboration tool',
    // color: 'bg-primary/10', // Note: API Note type might not have color yet, check type definition or add extended type
    userId: '1',
    isPinned: true,
    isFavorite: true,
    isDeleted: false,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
    tags: ['ideas', 'projects'],
  },
  {
    _id: '2',
    title: 'Meeting Notes - Jan 15',
    content: '## Sprint Planning\n\n- Discussed Q1 roadmap\n- Assigned tasks to team members\n- Set deadlines for milestones',
    userId: '1',
    isPinned: true,
    isFavorite: false,
    isDeleted: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    tags: ['meetings', 'planning'],
  },
  {
    _id: '3',
    title: 'Code Snippets',
    content: '```typescript\nconst useDebounce = (value, delay) => {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  // ...\n};\n```',
    userId: '1',
    isPinned: false,
    isFavorite: true,
    isDeleted: false,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-10',
    tags: ['code', 'snippets'],
  },
  {
    _id: '4',
    title: 'Reading List',
    content: '- Clean Code by Robert C. Martin\n- The Pragmatic Programmer\n- Designing Data-Intensive Applications',
    userId: '1',
    isPinned: false,
    isFavorite: false,
    isDeleted: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    tags: ['books', 'learning'],
  },
  {
    _id: '5',
    title: 'API Design Notes',
    content: '## RESTful Principles\n\n1. Use nouns for resources\n2. Use HTTP methods correctly\n3. Version your API\n4. Use proper status codes',
    userId: '1',
    isPinned: false,
    isFavorite: false,
    isDeleted: false,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-07',
    tags: ['api', 'design'],
  },
  {
    _id: '6',
    title: 'Weekly Goals',
    content: '- [ ] Complete feature A\n- [x] Review PRs\n- [ ] Update documentation\n- [ ] Team sync meeting',
    userId: '1',
    isPinned: false,
    isFavorite: false,
    isDeleted: false,
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
    tags: ['goals', 'weekly'],
  },
];

interface NoteCardProps {
  note: UiNote | Note;
  onPin: (id: string) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
}

function NoteCard({ note, onPin, onFavorite, onDelete, onEdit, onView }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onView(note as Note)}
      className={cn(
        "group p-4 rounded-xl border bg-card transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:border-primary/30"
      )}
      style={{
        backgroundColor: note.color ? `${note.color}14` : undefined, // ~8% opacity
        borderColor: note.color ? `${note.color}4D` : undefined, // ~30% opacity
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onPin(note._id);
            }}
          >
            <Pin className={cn("h-3.5 w-3.5", note.isPinned && "fill-current text-primary")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(note._id);
            }}
          >
            <Star className={cn("h-3.5 w-3.5", note.isFavorite && "fill-current text-warning")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note as Note);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note._id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-3 mb-3 whitespace-pre-line">
        {note.content.replace(/[#*`\[\]]/g, '').slice(0, 150)}
      </p>

      <div className="flex items-center gap-2">
        {note.tags && note.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-2xs">
            {tag}
          </Badge>
        ))}
        {note.tags && note.tags.length > 2 && (
          <span className="text-2xs text-muted-foreground">+{note.tags.length - 2}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await notesApi.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note._id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );

    try {
      if (id.length > 5) {
        // Toggle pin status
        const note = notes.find(n => n._id === id);
        if (note) {
          await notesApi.pinNote(id, !note.isPinned);
        }
      }
    } catch (error) {
      toast.error('Failed to update pin status');
      loadNotes();
    }
  };

  const handleFavorite = async (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note._id === id ? { ...note, isFavorite: !note.isFavorite } : note
      )
    );

    try {
      if (id.length > 5) {
        const note = notes.find(n => n._id === id);
        if (note) {
          await notesApi.updateNote(id, { isFavorite: !note.isFavorite });
        }
      }
    } catch (error) {
      toast.error('Failed to update favorite status');
      loadNotes();
    }
  };

  const handleDelete = async (id: string) => {
    setNotes((prev) => prev.filter(n => n._id !== id));

    try {
      if (id.length > 5) {
        await notesApi.deleteNote(id);
        toast.success('Note moved to trash');
      }
    } catch (error) {
      toast.error('Failed to delete note');
      loadNotes();
    }
  };

  const handleView = (note: Note) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setViewDialogOpen(false); // Close view dialog if open
    setSelectedNote(note);
    setEditDialogOpen(true);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setEditDialogOpen(true);
  };

  const handleSaveNote = async (data: NoteCreate | NoteUpdate) => {
    try {
      if (selectedNote) {
        // Update existing note
        await notesApi.updateNote(selectedNote._id, data as NoteUpdate);
        toast.success('Note updated');
      } else {
        // Create new note
        await notesApi.createNote(data as NoteCreate);
        toast.success('Note created');
      }
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
      throw error; // Re-throw to let dialog handle loading state
    }
  };

  const filteredNotes = notes
    .filter((note) => !note.isDeleted)
    .filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const otherNotes = filteredNotes.filter((note) => !note.isPinned);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Notes"
        description="Capture and organize your thoughts"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90" onClick={handleCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center border rounded-lg p-1 ml-auto">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Pinned</h2>
          </div>
          <div className={cn(
            "grid gap-4",
            view === 'grid'
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onPin={handlePin}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      {otherNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Other notes</h2>
          )}
          <div className={cn(
            "grid gap-4",
            view === 'grid'
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {otherNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onPin={handlePin}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Edit className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No notes found</h3>
          <p className="text-sm text-muted-foreground">
            Create a new note to get started
          </p>
        </motion.div>
      )}

      {/* Note View Dialog (Read-only) */}
      <NoteViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        note={selectedNote}
        onEdit={() => handleEdit(selectedNote!)}
        onPin={() => selectedNote && handlePin(selectedNote._id)}
        onFavorite={() => selectedNote && handleFavorite(selectedNote._id)}
        onDelete={() => {
          if (selectedNote) {
            handleDelete(selectedNote._id);
            setViewDialogOpen(false);
          }
        }}
      />

      {/* Note Edit Dialog */}
      <NoteDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        note={selectedNote}
        onSave={handleSaveNote}
      />
    </div>
  );
}
