// // lib/pdfmonkey.ts
// export async function generateCertificate(enrollment: any) {
//   const API_KEY = process.env.NEXT_PUBLIC_PDFMONKEY_API_KEY;
//   const TEMPLATE_ID = process.env.NEXT_PUBLIC_PDFMONKEY_TEMPLATE_ID;

//   if (!API_KEY || !TEMPLATE_ID) {
//     throw new Error("PDFMonkey credentials are missing");
//   }

//   const payload = {
//     document: {
//       document_template_id: TEMPLATE_ID,
//       payload: {
//         student_name: enrollment.student.name,
//         course_title: enrollment.course.title,
//         completion_date: new Date().toLocaleDateString(),
//       }
//     }
//   };

//   const response = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${API_KEY}`
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     throw new Error("Certificate generation failed");
//   }

//   const result = await response.json();
//   return result.data.attributes.download_url;
// }


// lib/pdfmonkey.ts
// export async function generateCertificate(enrollment: any) {
//   const API_KEY = process.env.NEXT_PUBLIC_PDFMONKEY_API_KEY;
//   const TEMPLATE_ID = process.env.NEXT_PUBLIC_PDFMONKEY_TEMPLATE_ID;

//   if (!API_KEY || !TEMPLATE_ID) {
//     throw new Error("PDFMonkey credentials are missing");
//   }

//   try {
//     const payload = {
//       document: {
//         document_template_id: TEMPLATE_ID,
//         payload: {
//           student_name: enrollment.student.name,
//           course_title: enrollment.course.title,
//           completion_date: new Date().toLocaleDateString(),
//           certificate_id: `CERT-${Date.now()}`,
//           issue_date: new Date().toLocaleDateString(),
//         },
//         status: "pending",
//         metadata: {
//           enrollment_id: enrollment._id,
//           course_id: enrollment.course._id,
//           student_id: enrollment.student._id,
//         },
//       },
//     };

//     const response = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${API_KEY}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Certificate generation failed");
//     }

//     const result = await response.json();
//     return {
//       downloadUrl: result.document.download_url,
//       previewUrl: result.document.preview_url,
//       documentId: result.document.id,
//     };
//   } catch (error) {
//     console.error("PDFMonkey API Error:", error);
//     throw error;
//   }
// }


// lib/pdfmonkey.ts
const PDFMONKEY_API_KEY = process.env.NEXT_PUBLIC_PDFMONKEY_API_KEY!;
const PDFMONKEY_TEMPLATE_ID = process.env.NEXT_PUBLIC_PDFMONKEY_TEMPLATE_ID!;
const API_BASE_URL = "https://api.pdfmonkey.io/api/v1/documents";

export async function generateCertificate(data: any) {
  const payload = {
    document: {
      document_template_id: PDFMONKEY_TEMPLATE_ID,
      payload: data,
    },
  };

  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PDFMONKEY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to generate certificate");

  const json = await res.json();
  return json?.data?.attributes?.download_url;
}
