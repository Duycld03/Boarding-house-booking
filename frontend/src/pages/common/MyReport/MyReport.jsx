import { getMyReport } from "@/api/ownerUser/myReport";
import { useEffect, useState } from "react";

function MyReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const response = await getMyReport();

      setReport(response);
    } catch (error) {
      console.log("Fetch report error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>This is my report</h2>
    </div>
  );
}

export default MyReport;
