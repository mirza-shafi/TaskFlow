import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/types/api';
import { Edit, Pin, Star, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onEdit?: () => void;
  onPin?: () => void;
  onFavorite?: () => void;
  onDelete?: () => void;
}

export function NoteViewDialog({
  open,
  onOpenChange,
  note,
  onEdit,
  onPin,
  onFavorite,
  onDelete,
}: NoteViewDialogProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="flex-1 text-2xl">{note.title}</DialogTitle>
            <div className="flex items-center gap-1">
              {onPin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPin}
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className={cn('h-4 w-4', note.isPinned && 'fill-current text-primary')} />
                </Button>
              )}
              {onFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onFavorite}
                  title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={cn('h-4 w-4', note.isFavorite && 'fill-current text-warning')} />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  title="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Color indicator */}
          {note.color && (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md border-2"
                style={{ backgroundColor: note.color }}
              />
              <span className="text-sm text-muted-foreground">Color</span>
            </div>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {note.content || <span className="text-muted-foreground italic">No content</span>}
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <div>Created: {new Date(note.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(note.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Note
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
