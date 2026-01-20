import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Task } from '../types/task.types';

interface Column {
  name: string;
  items: Task[];
}

interface Columns {
  [key: string]: Column;
}

interface KanbanBoardProps {
  columns: Columns;
  onDragEnd: (result: DropResult) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, onDragEnd, onEdit, onDelete }) => {
  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column]) => {
          return (
            <div className={`kanban-column column-${columnId}`} key={columnId}>
              <div className="column-header">
                <h2 className="column-title">
                  {column.name}
                  <span className="task-count">{column.items.length}</span>
                </h2>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    className={`droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '8px'
                            }}
                          >
                            <TaskCard 
                              task={item} 
                              onEdit={onEdit} 
                              onDelete={onDelete} 
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
