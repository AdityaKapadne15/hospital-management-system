import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Input,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TableSortLabel,
  Card,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { saveAs } from "file-saver";
import patientData from "./data.json";
import "./styles.css";

const doctors = {
  "Dr. Johnson": "Orthopedics",
  "Dr. Brown": "Neurology",
  "Dr. Jones": "Oncology",
  "Dr. Smith": "Cardiology",
  "Dr. Williams": "Pediatrics",
};

const sampleJson = [
  {
    mbi: "3AT9VX8RW56",
    first_name: "Lydia",
    last_name: "Foster",
    email: "lfoster78@aol.com",
    phone: "555-213-5094",
    address: "45 Pine Street",
    gender: "Female",
    age: 34,
    race: "Caucasian",
    date_registered: "2/1/2025",
    attending_doctor: "Dr. Williams",
    department: "Pediatrics",
    heart_rate: 72,
    blood_pressure: { sbp: 118, dbp: 77 },
    HbA1c: 5.2,
    medical_history: "Asthma",
  },
];

const departments = Object.values(doctors);

const PatientManagementSystem = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "first_name",
    direction: "asc",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPatient, setNewPatient] = useState({
    mbi: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    date_registered: "",
    attending_doctor: "",
    department: "",
    heart_rate: "",
    blood_pressure: { sbp: "", dbp: "" },
    HbA1c: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isValid, setIsValid] = useState(false); // Ensures the button is enabled
  const [importOption, setImportOption] = useState("form");
  const [importedPatients, setImportedPatients] = useState([]);
  const [isJsonImported, setIsJsonImported] = useState(false);

  useEffect(() => {
    setPatients(patientData);
    setFilteredPatients(patientData);
  }, []);

  useEffect(() => {
    let result = [...patients];

    if (selectedDepartments.length > 0) {
      result = result.filter((patient) =>
        selectedDepartments.includes(patient.department)
      );
    }

    if (searchTerm) {
      result = result.filter((patient) =>
        Object.values(patient).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredPatients(result);
  }, [patients, selectedDepartments, searchTerm]);

  // Handle Login
  const handleLogin = () => {
    if (username === "admin" && password === "adminpass") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid username or password");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  const handleDepartmentFilter = (department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((dep) => dep !== department)
        : [...prev, department]
    );
  };

  const handleAddPatient = () => {
    if (!isValid && !isJsonImported) return; // Ensure either form is valid OR JSON is imported

    let updatedPatients = [...patients];

    if (isJsonImported) {
      // Add only if JSON was imported, ensuring it's not duplicated
      updatedPatients = [...updatedPatients, ...importedPatients];
      setImportedPatients([]); // Clear imported patients after adding
      setIsJsonImported(false); // Reset flag
    } else {
      updatedPatients.push(newPatient);
    }

    setPatients(updatedPatients);
    setFilteredPatients(updatedPatients);
    setIsAddDialogOpen(false); // Close dialog only after clicking "Add Patient"

    setNewPatient({
      mbi: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      date_registered: "",
      attending_doctor: "",
      department: "",
      heart_rate: "",
      blood_pressure: { sbp: "", dbp: "" },
      HbA1c: "",
      medical_history: "",
    });
  };

  const handleDownloadSample = () => {
    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "sample-patients.json");
  };

  const handleSelectPatient = (mbi) => {
    setSelectedPatients((prev) =>
      prev.includes(mbi) ? prev.filter((id) => id !== mbi) : [...prev, mbi]
    );
  };

  const handleDeletePatients = () => {
    setPatients(
      patients.filter((patient) => !selectedPatients.includes(patient.mbi))
    );
    setSelectedPatients([]);
  };

  const handleViewDetails = (patient) => {
    setSelectedPatientDetails(patient);
    setIsDetailsDialogOpen(true);
  };

  const handleImportJsonFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          console.log("Imported JSON:", jsonData);

          // Store imported data separately without updating `patients`
          setImportedPatients(jsonData);
          setIsJsonImported(true);
        } catch (error) {
          alert("Error parsing JSON. Please make sure it's a valid JSON file.");
          setImportedPatients([]); // Clear imported data on error
          setIsJsonImported(false);
        }
      };
      reader.readAsText(file);
    }
  };

  // Sorting function
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key] || ""; // Handle undefined values
    const bValue = b[sortConfig.key] || "";

    if (typeof aValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  // Function to toggle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    const isValidForm =
      newPatient.mbi &&
      newPatient.first_name &&
      newPatient.last_name &&
      newPatient.email &&
      /\S+@\S+\.\S+/.test(newPatient.email) && // Email format check
      newPatient.phone &&
      newPatient.address &&
      newPatient.date_registered &&
      newPatient.attending_doctor &&
      newPatient.heart_rate &&
      newPatient.blood_pressure?.sbp &&
      newPatient.blood_pressure?.dbp &&
      newPatient.HbA1c && // Check HbA1c as well
      newPatient.medical_history;

    setIsValid(isValidForm); // Set the button's enabled state
  }, [newPatient]);

  useEffect(() => {
    if (newPatient.attending_doctor) {
      // Automatically select department based on doctor
      const selectedDepartment = doctors[newPatient.attending_doctor];
      setNewPatient((prev) => ({
        ...prev,
        department: selectedDepartment,
      }));
    }
  }, [newPatient.attending_doctor]);

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <Card className="w-96 p-6">
          <h2 className="text-xl font-bold text-center mb-4">Login</h2>
          <div className="mb-4">
            <label>Username</label>
            <Input
              fullWidth
              value={username}
              placeholder="Enter Username"
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="mb-4">
            <label>Password</label>
            <Input
              fullWidth
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>
          <Button fullWidth variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </Card>
        {/* Demo credentials */}
        <p className="text-sm text-center text-gray-600">
          For demo access, use <strong>Username: admin</strong> and{" "}
          <strong>Password: adminpass</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <img
          src="./hospital-management-system/public/hospital-management-system-logo-light.png"
          alt="Hospital Management System Logo"
          className="logo"
          style={{
            height: "50px",
            width: "auto",
          }}
        />
        <Input
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          sx={{
            "&::placeholder": { color: "#f5f5f5", opacity: 1 },
            width: "300px",
            borderRadius: "0px",
            backgroundColor: "#f5f5f5",
          }}
          startAdornment={
            <InputAdornment position="start">
              <IconButton>
                <Search />
              </IconButton>
            </InputAdornment>
          }
          endAdornment={
            searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm("")}>
                  <Close />
                </IconButton>
              </InputAdornment>
            )
          }
        />
        <div
          className="user-profile"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <p style={{ marginTop: "0px", fontSize: "14px" }}>
            Hello,<strong style={{ fontSize: "16px" }}> Admin</strong>
          </p>
          <Button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="sidebar">
        <h3>Filters</h3>
        {departments.map((department) => (
          <div key={department}>
            <Checkbox
              checked={selectedDepartments.includes(department)}
              onChange={() => handleDepartmentFilter(department)}
            />
            <label>{department}</label>
          </div>
        ))}
        <div className="button-group">
          <h3>Action(s)</h3>
          <Button className="add-btn" onClick={() => setIsAddDialogOpen(true)}>
            <Add /> Add Patient
          </Button>
          {selectedPatients.length > 0 && (
            <Button
              className="add-btn"
              onClick={handleDeletePatients}
              color="secondary"
            >
              <Delete /> Remove Selected
            </Button>
          )}
        </div>
      </div>
      <div className="main-content">
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "mbi"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("mbi")}
                  >
                    MBI
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "first_name"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("first_name")}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "last_name"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("last_name")}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "date_registered"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("date_registered")}
                  >
                    Date Registered
                  </TableSortLabel>
                </TableCell>
                <TableCell>Attending Doctor</TableCell>
                <TableCell>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPatients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient) => (
                  <TableRow
                    key={patient.mbi}
                    onClick={() => handleViewDetails(patient)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedPatients.includes(patient.mbi)}
                        onChange={() => handleSelectPatient(patient.mbi)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>{patient.mbi}</TableCell>
                    <TableCell>{patient.first_name}</TableCell>
                    <TableCell>{patient.last_name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.address}</TableCell>
                    <TableCell>{patient.date_registered}</TableCell>
                    <TableCell>{patient.attending_doctor}</TableCell>
                    <TableCell>{patient.department}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredPatients.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
          sx={{
            "& .MuiTablePagination-root": { overflowX: "hidden" }, // Prevent horizontal scroll
            "& .MuiTablePagination-select": { minWidth: "60px", width: "80px" }, // Fix dropdown width
          }}
        />

        {/* Add Patient Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogContent className="dialog-content">
            <FormControl component="fieldset">
              <FormLabel component="legend">Options</FormLabel>
              <RadioGroup
                value={importOption}
                onChange={(e) => setImportOption(e.target.value)}
                row
              >
                <FormControlLabel
                  value="form"
                  control={<Radio />}
                  label="Form"
                />
                <FormControlLabel
                  value="json"
                  control={<Radio />}
                  label="Import JSON"
                />
              </RadioGroup>
            </FormControl>

            {importOption === "form" ? (
              <div className="form-grid">
                <TextField
                  label="MBI"
                  value={newPatient.mbi}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, mbi: e.target.value })
                  }
                  required
                  className="full-width"
                  InputLabelProps={{ shrink: newPatient.mbi.length > 0 }}
                  error={!newPatient.mbi}
                  helperText={!newPatient.mbi && "Required"}
                />
                <TextField
                  label="First Name"
                  value={newPatient.first_name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, first_name: e.target.value })
                  }
                  required
                  className="medium-width"
                  InputLabelProps={{ shrink: newPatient.first_name.length > 0 }}
                  error={!newPatient.first_name}
                  helperText={!newPatient.first_name && "Required"}
                />
                <TextField
                  label="Last Name"
                  value={newPatient.last_name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, last_name: e.target.value })
                  }
                  required
                  className="medium-width"
                  InputLabelProps={{ shrink: newPatient.last_name.length > 0 }}
                  error={!newPatient.last_name}
                  helperText={!newPatient.last_name && "Required"}
                />
                <TextField
                  label="Email"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                  required
                  className="medium-width"
                  InputLabelProps={{ shrink: newPatient.email.length > 0 }}
                  error={
                    !newPatient.email || !/\S+@\S+\.\S+/.test(newPatient.email)
                  }
                  helperText={
                    !newPatient.email
                      ? "Required"
                      : !/\S+@\S+\.\S+/.test(newPatient.email) &&
                        "Invalid email"
                  }
                />
                <TextField
                  label="Phone"
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                  required
                  className="small-width"
                  InputLabelProps={{ shrink: newPatient.phone.length > 0 }}
                  error={!newPatient.phone}
                  helperText={!newPatient.phone && "Required"}
                />
                <TextField
                  label="Address"
                  value={newPatient.address}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                  required
                  className="full-width"
                  InputLabelProps={{ shrink: newPatient.address.length > 0 }}
                  error={!newPatient.address}
                  helperText={!newPatient.address && "Required"}
                />
                <TextField
                  label="Date Registered"
                  type="date"
                  value={newPatient.date_registered}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      date_registered: e.target.value,
                    })
                  }
                  required
                  className="full-width"
                  InputLabelProps={{ shrink: true }}
                  error={!newPatient.date_registered}
                  helperText={!newPatient.date_registered && "Required"}
                />
                <Select
                  value={newPatient.attending_doctor}
                  onChange={(e) => {
                    const doctor = e.target.value;
                    setNewPatient({
                      ...newPatient,
                      attending_doctor: doctor,
                      department: doctors[doctor],
                    });
                  }}
                  required
                  className="medium-width"
                  InputLabelProps={{
                    shrink: newPatient.attending_doctor.length > 0,
                  }}
                  displayEmpty
                  error={!newPatient.attending_doctor}
                >
                  <MenuItem value="" disabled>
                    {" "}
                    Select Doctor{" "}
                  </MenuItem>{" "}
                  {Object.keys(doctors).map((doctor) => (
                    <MenuItem key={doctor} value={doctor}>
                      {" "}
                      {doctor}{" "}
                    </MenuItem>
                  ))}
                </Select>{" "}
                <TextField
                  label="Department"
                  value={newPatient.department}
                  disabled
                  className="medium-width"
                  InputLabelProps={{ shrink: newPatient.department.length > 0 }}
                />
                <TextField
                  label="Heart Rate"
                  value={newPatient.heart_rate}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, heart_rate: e.target.value })
                  }
                  required
                  className="small-width"
                  InputLabelProps={{ shrink: newPatient.heart_rate.length > 0 }}
                  error={!newPatient.heart_rate}
                  helperText={!newPatient.heart_rate && "Required"}
                />
                <TextField
                  label="Systolic BP"
                  value={newPatient.blood_pressure.sbp}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      blood_pressure: {
                        ...newPatient.blood_pressure,
                        sbp: e.target.value,
                      },
                    })
                  }
                  required
                  className="small-width"
                  InputLabelProps={{
                    shrink: newPatient.blood_pressure?.sbp.length > 0,
                  }}
                  error={!newPatient.blood_pressure.sbp}
                  helperText={!newPatient.blood_pressure.sbp && "Required"}
                />
                <TextField
                  label="Diastolic BP"
                  value={newPatient.blood_pressure.dbp}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      blood_pressure: {
                        ...newPatient.blood_pressure,
                        dbp: e.target.value,
                      },
                    })
                  }
                  required
                  className="small-width"
                  InputLabelProps={{
                    shrink: newPatient.blood_pressure?.dbp.length > 0,
                  }}
                  error={!newPatient.blood_pressure.dbp}
                  helperText={!newPatient.blood_pressure.dbp && "Required"}
                />
                <TextField
                  label="HbA1c"
                  value={newPatient.HbA1c}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, HbA1c: e.target.value })
                  }
                  required
                  className="small-width"
                  InputLabelProps={{ shrink: newPatient.HbA1c.length > 0 }}
                  error={!newPatient.HbA1c}
                  helperText={!newPatient.HbA1c && "Required"}
                />
                <TextField
                  label="Medical History"
                  value={newPatient.medical_history}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      medical_history: e.target.value,
                    })
                  }
                  required
                  className="full-width"
                  InputLabelProps={{
                    shrink: newPatient.medical_history?.length > 0,
                  }}
                  error={!newPatient.medical_history}
                  helperText={!newPatient.medical_history && "Required"}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Input
                    accept="application/json"
                    type="file"
                    onChange={handleImportJsonFile}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      borderRadius: "50px",
                      width: "200px",
                      height: "40px",
                      fontSize: "12px",
                      marginLeft: "20px",
                    }}
                    onClick={handleDownloadSample}
                  >
                    Download Sample JSON
                  </Button>
                </div>
                {importedPatients.length > 0 && (
                  <div
                    style={{
                      width: "100%",
                      margin: "auto",
                      borderTop: "1px solid grey",
                      borderRadius: "5px",
                    }}
                  >
                    {importedPatients.map((patient, index) => (
                      <Accordion
                        key={index}
                        style={{ borderTop: "1px solid grey" }}
                      >
                        <AccordionSummary>
                          Patient ID: {patient.mbi} - {patient.first_name}{" "}
                          {patient.last_name}
                        </AccordionSummary>
                        <AccordionDetails>
                          <pre>{JSON.stringify(patient, null, 2)}</pre>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleAddPatient}
              color="primary"
              disabled={!(isValid || isJsonImported)} // Enable if form is valid OR JSON is imported
            >
              Add Patient
            </Button>
          </DialogActions>
        </Dialog>
        {/* Patient Details Dialog */}
        <Dialog
          className="dashboard"
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Patient Details</DialogTitle>
          <DialogContent>
            {" "}
            {selectedPatientDetails && (
              <div>
                <p>
                  {" "}
                  <strong>MBI:</strong> {selectedPatientDetails.mbi}{" "}
                </p>
                <p>
                  <strong>Patient Details:</strong>{" "}
                  {`${selectedPatientDetails.first_name} ${selectedPatientDetails.last_name}, ${selectedPatientDetails.age}, ${selectedPatientDetails.gender}, ${selectedPatientDetails.race}`}{" "}
                </p>
                <p>
                  {" "}
                  <strong>Date Registered:</strong>{" "}
                  {selectedPatientDetails.date_registered}{" "}
                </p>
                <p>
                  {" "}
                  <strong>Attending Doctor:</strong>{" "}
                  {`${selectedPatientDetails.attending_doctor} (${selectedPatientDetails.department})`}{" "}
                </p>
                <p>
                  {" "}
                  <strong>Heart Rate:</strong>{" "}
                  {selectedPatientDetails.heart_rate}{" "}
                </p>
                <p>
                  {" "}
                  <strong>Systolic Blood Pressure:</strong>{" "}
                  {selectedPatientDetails.blood_pressure?.sbp}{" "}
                </p>
                <p>
                  {" "}
                  <strong>Diastolic Blood Pressure:</strong>{" "}
                  {selectedPatientDetails.blood_pressure?.dbp}{" "}
                </p>
                <p>
                  {" "}
                  <strong>HbA1c:</strong> {selectedPatientDetails.HbA1c}{" "}
                </p>
                <p>
                  {" "}
                  <strong>Medical History:</strong>{" "}
                  {selectedPatientDetails.medical_history}{" "}
                </p>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsDetailsDialogOpen(false)}
              color="primary"
            >
              {" "}
              Close{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientManagementSystem;
