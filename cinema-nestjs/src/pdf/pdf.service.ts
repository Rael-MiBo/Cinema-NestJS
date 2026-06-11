import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

interface ReceiptData {
  pedidoId: number;
  dataHora: string;
  valorTotal: number;
  metodoPagamento: string;
  ingressos: Array<{
    filme: string;
    sala: string;
    data: string;
    fila: number;
    assento: number;
    tipo: string;
    valorPago: number;
  }>;
  lanches?: Array<{
    quantidade: number;
    nome: string;
  }>;
}

@Injectable()
export class PdfService {
  generateReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('COMPROVANTE DE COMPRA', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').text('Cinema', { align: 'center' });
      doc.moveTo(30, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(0.5);

      // Pedido info
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Informações do Pedido', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Pedido: #${data.pedidoId}`);
      doc.text(`Data/Hora: ${new Date(data.dataHora).toLocaleString('pt-BR')}`);
      doc.text(`Valor Total: R$ ${data.valorTotal.toFixed(2)}`);
      doc.text(`Pagamento: ${data.metodoPagamento}`);
      doc.moveDown(0.5);

      // Ingressos
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Ingressos', { underline: true });
      doc.fontSize(9).font('Helvetica');
      data.ingressos.forEach((ing) => {
        doc.text(`${ing.filme} (Sala ${ing.sala}) - ${ing.data}`);
        doc.text(
          `  Fila ${ing.fila + 1} | Assento ${ing.assento + 1} | ${ing.tipo.toUpperCase()} | R$ ${ing.valorPago.toFixed(2)}`,
        );
      });
      doc.moveDown(0.5);

      // Lanches
      if (data.lanches && data.lanches.length > 0) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Combos', { underline: true });
        doc.fontSize(9).font('Helvetica');
        data.lanches.forEach((item) => {
          doc.text(`${item.quantidade}x ${item.nome}`);
        });
        doc.moveDown(0.5);
      }

      // Footer
      doc.moveTo(30, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .font('Helvetica')
        .text('Apresente este comprovante na entrada do cinema.', {
          align: 'center',
        });
      doc.text('Comprovante válido por 30 dias.', { align: 'center' });

      doc.end();
    });
  }
}
