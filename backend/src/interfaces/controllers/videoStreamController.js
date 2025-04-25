import mongoose from 'mongoose';
import { gridFSBucket } from '../../utils/multer-config.js';

class VideoStreamController {
  async streamVideo(req, res) {
    try {
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      
      // First check if file exists
      const files = await gridFSBucket.find({ _id: fileId }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      const file = files[0];
      
      // Set proper headers for streaming
      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
      
      // Handle range requests for video streaming
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
        const chunkSize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${file.length}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': file.contentType
        });
        
        const downloadStream = gridFSBucket.openDownloadStream(fileId, {
          start,
          end: end + 1
        });
        
        downloadStream.pipe(res);
      } else {
        res.set('Content-Length', file.length);
        const downloadStream = gridFSBucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
      }
    } catch (err) {
      console.error('Streaming error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getVideoInfo(req, res) {
    try {
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      const files = await gridFSBucket.find({ _id: fileId }).toArray();
      
      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const file = files[0];
      res.json({
        id: file._id,
        filename: file.filename,
        contentType: file.contentType,
        length: file.length,
        uploadDate: file.uploadDate,
        metadata: file.metadata
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new VideoStreamController();