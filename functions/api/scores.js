// Bản Pages Functions: chuyển về cùng router (có kiểm tra quyền) với bản Worker.
import { handleApi } from '../../src/worker.js';

export const onRequest = ({ request, env }) => handleApi(request, env);
