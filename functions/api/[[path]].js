// Bản Pages Functions: mọi /api/* khác (auth, students, content, submissions) dùng chung router của Worker.
import { handleApi } from '../../src/worker.js';

export const onRequest = ({ request, env }) => handleApi(request, env);
