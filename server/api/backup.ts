import { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const backupRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/backup', {
    handler: async (request, reply) => {
      // Add authentication here
      const dbBasePath = path.resolve(process.cwd(), process.env.SQLITE_DB_PATH || 'chat.db');
      const dbFiles = [
        dbBasePath,                // chat.db
        `${dbBasePath}-wal`,      // chat.db-wal
        `${dbBasePath}-shm`       // chat.db-shm
      ];

      // Check if files exist
      try {
        await Promise.all(dbFiles.map(file => fs.promises.access(file)));
      } catch (error) {
        reply.code(404).send({ error: 'One or more database files not found' });
        return;
      }

      // Create zip file
      const zip = new JSZip();

      // Add files to zip
      await Promise.all(dbFiles.map(async (file) => {
        const content = await fs.promises.readFile(file);
        zip.file(path.basename(file), content);
      }));

      // Generate zip
      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });

      // Send response
      reply
        .type('application/zip')
        .header('Content-Disposition', 'attachment; filename=db-backup.zip')
        .send(zipBuffer);
    }
  });
};

export default backupRoute;