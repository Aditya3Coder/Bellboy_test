import React, { useState, useEffect, useRef } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  Typography,
  Container,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  DialogTitle,
  Backdrop,
  CircularProgress,
  Stack,
  Link,
  Breadcrumbs,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import PropertiesDataGrid from "pages/properties/PropertiesDataGrid";
import { Link as RouterLink } from "react-router-dom";
import CustomErrorBox from "components/ErrorAlert";

const Properties = () => {
  const PROPERTIES_URL = "/properties/";
  // To store all properties list
  const [properties, setProperties] = useState({});
  // To show major errors
  const [error, setError] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  // To make API calls to protected endpoints
  const axios = useAxiosPrivate();
  // To open or close Create Form
  const [open, setOpen] = useState(false);
  // To Store the property details before creating
  const [newProperty, setCreateProperty] = useState({});
  const [availablePartners, setAvailablePartners] = useState([]);
  // To display errors on create form
  const [createFormError, setCreateFormError] = useState("");
// Storing Ref of Error box on Create Property popup
  const errorRef = useRef(null);

  async function fetchPartners() {
    try {
      const response = await axios.get(PROPERTIES_URL+"partners-list/");
      console.log("Available Partners List: ", response.data);
      if (response.data && response.data.length > 0) {
        setAvailablePartners(response.data);
      }
      else {
        setError("No Available Partners!");
        setIsDataLoading(false);
        setOpen(false);
      }
    } catch(error) {
      if(error.response?.data?.detail){
        setError(error.response.data.detail);
      }
      else {
        setError("Failed to fetch Partners. Please try again!");
      }
      setOpen(false);
      setIsDataLoading(false);
    }
  }

  // For Fetching properties Again after new property added
  // ------- Needs refector
  async function fetchData1() {
    try {
      const response = await axios.get(PROPERTIES_URL);
      setProperties(response.data);
      console.log("Data: ", response.data);
      setIsDataLoading(false);
    } catch (error) {
      console.log(error);
      if(error.response?.data?.detail){
        setError(error.response.data.detail);
      }
      else {
        setError("Failed to fetch properties. Please try again!");
      }
      setIsDataLoading(false);
    }
  }
  const handleCreateClick = () => {
    // To Open Create Form
    fetchPartners();
    setOpen(true);
  };

  const handleCreateClose = () => {
    // To Close Create Form
    setCreateFormError("");
    setOpen(false);
  };
  async function addNewProperty() {
    // To create a new Property using "newProperty" state


    console.log("NewProperty:", newProperty);
    try {
      const response = await axios.post(PROPERTIES_URL, newProperty);
      console.log(response.data);
      setIsDataLoading(true);
      // When Property added Successfully Fetch all properties again.
      fetchData1();
    } catch (error) {
      console.error(error);
      if(error.response?.data?.detail){
        setError(error.response.data.detail);
      }
      else {
        setError("Failed to add new property. Please try again!");
      }
      setIsDataLoading(false);
    }
  }
  const handleCreateSubmit = () => {
    // Check all fields are filled in
    if (
      !newProperty.name ||
      !newProperty.agent_name ||
      !newProperty.neighbourhood ||
      !newProperty.apt_number ||
      !newProperty.building_name ||
      !newProperty.gmaps_link ||
      !newProperty.num_cleaning_hours ||
      !newProperty.num_bedrooms ||
      !newProperty.num_cleaners ||
      !newProperty.default_checkin_time ||
      !newProperty.default_checkout_time ||
      !newProperty.partner
    ) {
      setCreateFormError("Please fill in all required fields.");
      // Scroll Top to the error
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setError("");
    setCreateFormError("");
    // If everything is good then create new property
    addNewProperty();
    setOpen(false);
  };

  const handleChange = (e) => {
    // set "newProperty" state on every change on form
    setCreateProperty({ ...newProperty, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Fetch properties when the page loads
    async function fetchData() {
      try {
        const response = await axios.get(PROPERTIES_URL);
        setProperties(response.data);
        console.log(response.data);
        setIsDataLoading(false);
      } catch (error) {
        console.log(error);
        if(error.response?.data?.detail){
          setError(error.response.data.detail);
        }
        else {
          setError("Failed to fetch properties. Please try again!");
        }
        setIsDataLoading(false);
      }
    }
    fetchData();
  }, []);

  async function onChange() {
    try {
      setIsDataLoading(true);
      const response = await axios.get(PROPERTIES_URL);
      setProperties(response.data);
      console.log(response.data);
      setIsDataLoading(false);
    } catch (error) {
      console.log(error);
      if(error.response?.data?.detail){
        setError(error.response.data.detail);
      }
      else {
        setError("Failed to fetch properties. Please try again!");
      }
      setIsDataLoading(false);
    }
  }
  function validateGmapsLink(value) {
    const mustMatch = /^(https:\/\/maps.app.goo.gl\/\w*)$/;
    const matches = value.match(mustMatch);
    if (!matches || matches[0] !== value ) {
      // True for error
      return true;
    }
    return false;
  }
 
  return (
    <>
      {isDataLoading ? (
        <Backdrop
          open={isDataLoading}
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <>


          <Container maxWidth="xl">
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "1rem" }}>
              <Link underline="hover" color="inherit" component={RouterLink} to={`/`}>
                Home
              </Link>
              <Typography color="text.primary">Properties</Typography>
            </Breadcrumbs>
          </Container>


          <Container component="main"  maxWidth="xl">
            <Grid container alignItems="center" justifyContent="space-between" sx={{ marginBottom: "0.5rem" }}>
              
              <Grid item>
                <Typography variant="h5">All Properties</Typography>
              </Grid>

              <Grid item>
                <Stack direction="row" alignItems="center" spacing={0}>
                  <Button variant="outlined" color="primary" size="large" onClick={handleCreateClick}>
                    Create
                  </Button>
                </Stack>
              </Grid>

            </Grid>

            {/* Errors releted to data fetching */}
            {error && <CustomErrorBox errorMessage={error} />}
            {/* Display All properties using PropertiesDataGrid component */}
            {properties && properties.length > 0 && <PropertiesDataGrid properties={properties} onBookingChange={onChange} />}
          </Container>




          {/* Create Form  */}
          <Dialog open={open} onClose={handleCreateClose}>
            <DialogTitle>Create Property</DialogTitle>
            <DialogContent>
              <DialogContentText>Enter the property details:</DialogContentText>
              {createFormError && (
                <Typography color="error" ref={errorRef}>
                  {createFormError}
                </Typography>
              )}
              <TextField autoFocus margin="dense" label="Name" type="text" fullWidth name="name" onChange={handleChange} required />
              <TextField margin="dense" label="Agent Name" type="text" fullWidth name="agent_name" onChange={handleChange} required />
              <TextField margin="dense" label="Neighbourhood" type="text" fullWidth name="neighbourhood" onChange={handleChange} required />
              <TextField margin="dense" label="Appartment Number" type="text" fullWidth name="apt_number" onChange={handleChange} required />
              <TextField margin="dense" label="Building Name" type="text" fullWidth name="building_name" onChange={handleChange} required />
              <TextField margin="dense" label="Location link" type="url" fullWidth name="gmaps_link" onChange={handleChange} required
                error={newProperty.gmaps_link !== undefined && validateGmapsLink(newProperty.gmaps_link)}
                helperText={newProperty.gmaps_link && validateGmapsLink(newProperty.gmaps_link) && "Invalid maps location link"}
              />
              <InputLabel htmlFor="partner_id">Select Partner</InputLabel>
              <Select
                autoFocus
                id="partner"
                margin="dense"
                name="partner"
                label="Partner"
                value={newProperty.partner || ''}
                onChange={handleChange}
                fullWidth
                required>
                {availablePartners &&
                  availablePartners.length > 0 &&
                  availablePartners.map((partner) => (
                    <MenuItem key={partner.id} value={partner.id}>
                      {partner.username}
                    </MenuItem>
                  ))}
              </Select>
              <TextField
                margin="dense"
                label="Number of Cleaning Hours"
                type="number"
                fullWidth
                name="num_cleaning_hours"
                onChange={handleChange}
                inputProps={{
                  min: 0,
                }}
                required
              />
              <TextField
                margin="dense"
                label="Number of Bedrooms"
                type="number"
                fullWidth
                name="num_bedrooms"
                onChange={handleChange}
                inputProps={{
                  min: 0,
                }}
                required
              />
              <TextField
                margin="dense"
                label="Number of Cleaners"
                type="number"
                fullWidth
                name="num_cleaners"
                onChange={handleChange}
                inputProps={{
                  min: 0,
                }}
                required
              />
              <TextField
                margin="dense"
                label="CheckIn Time"
                type="time"
                fullWidth
                name="default_checkin_time"
                onChange={handleChange}
                inputProps={{
                  step: 300, // 5 minutes step
                }}
                required
              />
              <TextField
                margin="dense"
                label="CheckOut Time"
                type="time"
                fullWidth
                name="default_checkout_time"
                onChange={handleChange}
                inputProps={{
                  step: 300, // 5 minutes step
                }}
                required
              />
              <TextField
                margin="dense"
                label="Deposit Amount"
                type="number"
                fullWidth
                name="default_deposit_amount"
                onChange={handleChange}
                InputProps={{
                  inputProps: {
                    
                    min: 0,
                    max: 999999999999.99,
                  },
                }}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCreateClose}>Cancel</Button>
              <Button onClick={handleCreateSubmit}>Save</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default Properties;
