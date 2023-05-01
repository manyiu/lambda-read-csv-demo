const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const xlsx = require("xlsx");

const s3 = new S3Client({ region: "us-east-1" });

exports.handler = async (event) => {
  for (let i = 0; i < event.Records.length; i++) {
    console.log(event.Records[i]);

    const command = new GetObjectCommand({
      Bucket: event.Records[i].s3.bucket.name,
      Key: event.Records[i].s3.object.key,
    });

    const response = await s3.send(command);

    console.log(response);
    console.log(response.Body);

    const buffers = [];

    response.Body.on("data", (chunk) => buffers.push(chunk));

    response.Body.on("end", () => {
      const wb = xlsx.read(Buffer.concat(buffers), { type: "buffer" });

      console.log(wb);

      const ws = wb.Sheets[wb.SheetNames[0]];

      console.log(ws);

      const data = xlsx.utils.sheet_to_json(ws);

      console.log(data);
    });
  }
};
