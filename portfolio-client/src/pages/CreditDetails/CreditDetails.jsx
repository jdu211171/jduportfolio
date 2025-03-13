import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosUtils";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledBox = styled(Box)({
  backgroundColor: "#cfe8fc",
  padding: "20px",
  borderRadius: "5px",
});

const CreditDetails = () => {
  const [student, setStudent] = useState(null);
  const [creditData, setCreditData] = useState([]);

  function base64DecodeUnicode(str) {
    // Convert URL-safe Base64 to standard Base64
    const base64 = (str + "==").replace(/-/g, "+").replace(/_/g, "/");

    // Decode Base64 to bytes
    const binaryString = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Convert bytes to a string
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(binaryString);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("student");

    if (encodedData) {
      try {
        // Decode the URI component and parse the JSON
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        // Handle the student data
        setStudent(decodedData);
      } catch (e) {
        console.error("Failed to decode or parse student data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCreditDetails = async (studentId) => {
      let response = await axios.post(`/api/kintone/getby`, {
        table: "credit_details",
        col: "studentId",
        val: studentId,
      });

      setCreditData(response.data.records);
    };

    if (student) {
      fetchCreditDetails(student.student_id);
    }
  }, [student]);

  return (
    <StyledBox>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          学生詳細
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>学生名</TableCell>
                <TableCell>提携大学</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {student?.first_name + " " + student?.last_name}
                </TableCell>
                <TableCell>{student?.partner_university}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          JDU単位数
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>番号</TableCell>
                <TableCell>科目名</TableCell>
                <TableCell>評価</TableCell>
                <TableCell>単位数</TableCell>
                <TableCell>取得日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creditData
                .filter(
                  (record) => record.gradeUniversityGroup.value !== "大学資格"
                )
                .map((record, rowNumber) => (
                  <TableRow key={record.$id.value}>
                    <TableCell>{rowNumber + 1}</TableCell>
                    <TableCell>{record.subject.value}</TableCell>
                    <TableCell>{record.grade.value}</TableCell>
                    <TableCell>{record.manualCredit.value}</TableCell>
                    <TableCell>{record.date.value}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          提携大学単位数
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>番号</TableCell>
                <TableCell>科目名</TableCell>
                <TableCell>評価</TableCell>
                <TableCell>単位数</TableCell>
                <TableCell>取得日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creditData
                .filter(
                  (record) => record.gradeUniversityGroup.value == "大学資格"
                )
                .map((record, rowNumber) => (
                  <TableRow key={record.$id.value}>
                    <TableCell>{rowNumber + 1}</TableCell>
                    <TableCell>{record.subject.value}</TableCell>
                    <TableCell>{record.grade.value}</TableCell>
                    <TableCell>{record.manualCredit.value}</TableCell>
                    <TableCell>{record.date.value}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </StyledBox>
  );
};

export default CreditDetails;
