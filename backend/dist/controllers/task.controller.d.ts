import { Request, Response, NextFunction } from 'express';
export declare class TaskController {
    getTasks(req: Request, res: Response, next: NextFunction): Promise<void>;
    createTask(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTask(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTask(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: TaskController;
export default _default;
//# sourceMappingURL=task.controller.d.ts.map