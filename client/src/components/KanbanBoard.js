import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function KanbanBoard({ columns, onDragEnd, onEdit, onDelete }) {
  return (
    <div className="kanban-board-container">
      <div className="kanban-board">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <div className="kanban-column" key={columnId}>
                <h2 className="kanban-column-title">{column.name}</h2>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      className="droppable-area"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
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
    </div>
  );
}