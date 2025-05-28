import puppeteer from "puppeteer";

export const generateCertificatePDFBuffer = async (
  name,
  courseName,
  instructorName,
  completionDate
) => {
  const html = `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600&display=swap');
          body {
            margin: 0; padding: 0; background-color: #f5f5f5;
          }
          .certificate-container {
            width: 1000px; height: 700px; margin: 0 auto;
            background: linear-gradient(to right, #f9f9f9, #fff, #f9f9f9);
            border: 20px solid #1a5276; box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
            padding: 50px; box-sizing: border-box; position: relative;
          }
          .border-decoration {
            position: absolute; width: calc(100% - 40px); height: calc(100% - 40px);
            border: 2px solid #d4af37; top: 20px; left: 20px; pointer-events: none;
          }
          .certificate-header {
            text-align: center; margin-bottom: 40px;
          }
          .certificate-title {
            font-family: 'Playfair Display', serif;
            font-size: 42px; font-weight: 700; color: #1a5276;
            margin-bottom: 10px; letter-spacing: 2px;
          }
          .certificate-subtitle {
            font-family: 'Montserrat', sans-serif;
            font-size: 16px; color: #555; letter-spacing: 4px;
            text-transform: uppercase; margin-bottom: 30px;
          }
          .certificate-body {
            text-align: center; margin: 40px 0;
          }
          .certificate-text {
            font-family: 'Montserrat', sans-serif;
            font-size: 18px; color: #333; line-height: 1.6; margin: 20px 0;
          }
          .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px; color: #1a5276;
            margin: 30px 0; padding: 15px 0;
            border-top: 2px solid #d4af37; border-bottom: 2px solid #d4af37;
          }
          .course-name {
            font-family: 'Playfair Display', serif;
            font-size: 28px; color: #2874a6; margin: 25px 0;
          }
          .signatures {
            display: flex; justify-content: space-between;
            margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd;
          }
          .signature-block {
            width: 45%; text-align: center;
          }
          .signature-line {
            border-top: 1px solid #1a5276;
            width: 200px; margin: 0 auto 10px; padding-top: 10px;
          }
          .signature-name {
            font-family: 'Playfair Display', serif;
            font-size: 18px; color: #1a5276;
          }
          .signature-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 14px; color: #666; font-style: italic;
          }
          .certificate-footer {
            text-align: center; margin-top: 40px;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px; color: #777;
          }
          .certificate-id {
            font-family: 'Montserrat', sans-serif;
            font-size: 12px; color: #999; text-align: right; margin-top: 20px;
          }
          .seal {
            position: absolute; top: 50px; right: 50px;
            width: 100px; height: 100px; background-color: #1a5276;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: #d4af37; font-family: 'Playfair Display', serif;
            font-size: 14px; text-align: center; border: 3px solid #d4af37;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
  <div class="border-decoration"></div>
  <div class="certificate-inner">
    <div class="seal">Certificate<br>of<br>Completion</div>
    <div class="certificate-header">
      <div class="certificate-title">Certificate of Completion</div>
      <div class="certificate-subtitle">This Certificate is Proudly Presented To</div>
    </div>
    <div class="certificate-body">
      <div class="certificate-text">In recognition of successful completion of</div>
      <div class="course-name">${courseName}</div>
      <div class="certificate-text">this certificate is awarded to</div>
      <div class="recipient-name">${name}</div>
      <div class="certificate-text">for demonstrating dedication, commitment, and mastery of the course material.</div>
    </div>
    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">Tutoring Platform</div>
        <div class="signature-title">Director of Education</div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${instructorName}</div>
        <div class="signature-title">Course Instructor</div>
      </div>
    </div>
    <div class="certificate-footer">
      <div class="completion-date">
        Date of Completion: ${new Date(completionDate).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}
      </div>
      <div class="certificate-id">
        Certificate ID: CERT-${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}
      </div>
    </div>
  </div>
</div>

      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.setViewport({ width: 1000, height: 750 });

  const buffer = await page.pdf({
    printBackground: true,
    width: "1000px",
    height: "750px",
    pageRanges: "1",
  });

  await browser.close();
  return buffer;
};
