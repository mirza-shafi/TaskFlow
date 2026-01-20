export declare enum TaskStatus {
    TODO = "todo",
    DOING = "doing",
    DONE = "done"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export interface CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date | null;
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
}
export interface TaskResponseDto {
    _id: string;
    user: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const validateCreateTaskDto: (data: any) => data is CreateTaskDto;
export declare const isValidTaskStatus: (status: string) => status is TaskStatus;
export declare const isValidTaskPriority: (priority: string) => priority is TaskPriority;
//# sourceMappingURL=task.dto.d.ts.map