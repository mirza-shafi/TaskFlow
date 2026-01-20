import { ITaskDocument } from '@/models/Task.model';
import { CreateTaskDto, UpdateTaskDto } from '@/dto/task.dto';
export declare class TaskService {
    getUserTasks(userId: string): Promise<ITaskDocument[]>;
    createTask(userId: string, data: CreateTaskDto): Promise<ITaskDocument>;
    updateTask(taskId: string, userId: string, data: UpdateTaskDto): Promise<ITaskDocument>;
    deleteTask(taskId: string, userId: string): Promise<void>;
}
declare const _default: TaskService;
export default _default;
//# sourceMappingURL=task.service.d.ts.map