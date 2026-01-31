import { Router, type Request, type Response, type NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

const router = Router();

// Load OpenAPI spec
const openApiPath = join(process.cwd(), 'openapi.yaml');
const openApiContent = readFileSync(openApiPath, 'utf8');
const openApiSpec = yaml.parse(openApiContent) as Record<string, unknown>;

const swaggerOptions = {
    customSiteTitle: 'Hyper API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
};

// Serve Swagger UI
const serve = (swaggerUi.serve as unknown) as (req: Request, res: Response, next: NextFunction) => void;

router.use('/', serve);
router.get('/', (_req: Request, res: Response) => {
    res.send(swaggerUi.generateHTML(openApiSpec, swaggerOptions));
});

export default router;
