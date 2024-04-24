import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Backdrop,
  CircularProgress,
  Stack,
  Link,
  Breadcrumbs,
} from "@mui/material";
import { Card, CardContent, Container } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AnalyticEcommerce from "components/cards/statistics/AnalyticEcommerce";
import BookingsDataGrid from "pages/bookings/BookingsDataGrid";
import { Link as RouterLink } from "react-router-dom";

const Property = () => {
  // property id from path parameters
  const { id } = useParams();
  const PROPERTY_URL = `/properties`;
  // To store Property details to be Displayed
  const [property, setProperty] = useState(null);
  // To store bookings against this Property
  const [propertyBookings, setPropertyBookings] = useState(null);
  // To display major errors
  const [error, setError] = useState("");
  // Show Loading when data is being fetched
  const [isDataLoading, setIsDataLoading] = useState(true);
  // To make calls to protected end points
  const axios = useAxiosPrivate();
  // To store Property details for Edit Property
  const [editProperty, setEditProperty] = useState({});
  // To open or close Edit booking popup
  const [open, setOpen] = useState(false);
  // To display errors on property edit form
  const [editFormError, setEditFormError] = useState("");
  // To open or close Create Booking Form
  const [createFormOpen, setCreateFormOpen] = useState(false);
  // To display errors on Booking Create form
  const [createFormError, setCreateFormError] = useState("");
  // Show Loading when bookings data is being fetched
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  // For creating new booking
  const [newBooking, setCreateBooking] = useState({
    property: "",
    start_date: "",
    end_date: "",
    checkin_time: "",
    checkout_time: "",
  });
  // Storing Ref of Error box on Edit Property popup
  const errorRef = useRef(null);
  // Storing Ref of Error box on Create booking popup
  const errorRef1 = useRef(null);
  function resetNewBookingData() {
    setCreateBooking({
      property: "",
      start_date: "",
      end_date: "",
      checkin_time: "",
      checkout_time: "",
    });
  }
  const handleCreateClick = () => {
    // To Open Create Form
    setCreateBooking({ ...newBooking, property: property.id });
    setCreateFormOpen(true);
  };
  const handleCreateClose = () => {
    // To Close Create Form
    setCreateFormError("");
    setCreateFormOpen(false);
    resetNewBookingData();
  };

  async function addnewBooking() {
    // To create a new Property using "newBooking" state
    console.log("newBooking:", newBooking);
    try {
      const response = await axios.post("/bookings/", newBooking);
      console.log(response.data);
      setIsBookingsLoading(true);
    } catch (error) {
      console.error(error);
      if(error.response?.data?.detail){
        setError(error.response.data.detail);
      }
      else {
        setError("Failed to add new booking. Please try again!");
      }
      setIsBookingsLoading(false);
    }
  }
  const handleCreateSubmit = () => {
    // Check all fields are filled in
    if (!newBooking.start_date || !newBooking.end_date || !newBooking.checkin_time || !newBooking.checkout_time) {
      setCreateFormError("Please fill in all required fields.");
      // Scroll Top to the error
      errorRef1.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setError("");
    setCreateFormError("");
    // If everything is good then create new property
    addnewBooking();

    setCreateFormOpen(false);
    resetNewBookingData();
  };

  useEffect(() => {
    async function fetchPropertyBookings() {
      try {
        const response = await axios.get(PROPERTY_URL + `/${id}/bookings`);
        console.log(response.data);
        setPropertyBookings(response.data);
        setIsBookingsLoading(false);
      } catch (error) {
        console.error(error);
        if(error.response?.data?.detail){
          setError(error.response.data.detail);
        }
        else {
          setError("Failed to fetch bookings against the property. Please try again!");
        }
        setIsDataLoading(false);
        setIsBookingsLoading(false);
      }
    }
    if (isBookingsLoading) {
      fetchPropertyBookings();
    }
  }, [isBookingsLoading, PROPERTY_URL, axios, id]);
  const handleCreateChange = (e) => {
    // set "newBooking" state on every change on form
    setCreateBooking({ ...newBooking, [e.target.name]: e.target.value });
  };

  const handleEditClick = (property) => {
    setEditProperty(property);
    setOpen(true);
  };

  const handleEditClose = () => {
    setOpen(false);
  };
  async function updateProperty() {
    try {
      const response = await axios.put(PROPERTY_URL + `/${property.id}/`, editProperty);
      console.log(response.data);

      setProperty(editProperty);
      setIsDataLoading(false);
    } catch (error) {
      console.error(error);
      if(error.response?.data?.detail){
        setError(error.response.data.detail);
      }
      else {
        setError("Failed to edit the property. Please try again!");
      }
      setIsDataLoading(false);
    }
  }
  const handleEditSubmit = () => {
    // Make sure all the fields are filled
    if (
      !editProperty.name ||
      !editProperty.agent_name ||
      !editProperty.neighbourhood ||
      !editProperty.apt_number ||
      !editProperty.building_name ||
      !editProperty.gmaps_link ||
      !editProperty.num_cleaning_hours ||
      !editProperty.num_bedrooms ||
      !editProperty.num_cleaners ||
      !editProperty.default_checkin_time ||
      !editProperty.default_checkout_time
    ) {
      setEditFormError("Please fill in all required fields.");
      // Scroll Top to the Property edit form error
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setError("");
    setEditFormError("");
    setIsDataLoading(true);

    updateProperty();
    setOpen(false);
  };

  const handleChange = (e) => {
    setEditProperty({ ...editProperty, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(PROPERTY_URL + `/${id}`);
        setProperty(response.data);
        setIsDataLoading(false);
      } catch (error) {
        console.error(error);
        if(error.response?.data?.detail){
          setError(error.response.data.detail);
        }
        else {
          setError("Failed to fetch property details. Please try again!");
        }
        setIsDataLoading(false);
      }
    }
    async function fetchPropertyBookings() {
      try {
        const response = await axios.get(PROPERTY_URL + `/${id}/bookings`);
        console.log(response.data);
        setPropertyBookings(response.data);
      } catch (error) {
        console.error(error);
        if(error.response?.data?.detail){
          setError(error.response.data.detail);
        }
        else {
          setError("Failed to fetch bookings against the property. Please try again!");
        }
        setIsDataLoading(false);
        setIsBookingsLoading(false);
      }
    }
    fetchData();
    fetchPropertyBookings();
  }, [id, PROPERTY_URL, axios]);

  return isDataLoading ? (
    <Backdrop
      open={isDataLoading}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : !error && property ? (
    <>
      <Container>
        <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "1rem" }}>
          <Link underline="hover" color="inherit" component={RouterLink} to={`/`}>
            Home
          </Link>
          <Link underline="hover" color="inherit" component={RouterLink} to={`/properties/`}>
            All Properties
          </Link>
          <Typography color="text.primary">{property.name}</Typography>
        </Breadcrumbs>
      </Container>
      <Container component="main">
        <Grid container alignItems="center" justifyContent="space-between" sx={{ marginBottom: "0.5rem" }}>
          <Grid item>
            <Typography variant="h5">{property.name}</Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={0}>
              <IconButton onClick={() => handleEditClick(property)}>
                <EditIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <AnalyticEcommerce title="Number of Bedrooms" count={property.num_bedrooms.toString()} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <AnalyticEcommerce title="Number of Cleaners" count={property.num_cleaners.toString()} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <AnalyticEcommerce title="Number of Cleaning Hours" count={property.num_cleaning_hours} />
          </Grid>
        </Grid>

        <Card
          style={{
            maxWidth: "80%",
            margin: "auto",
            marginTop: "20px",
          }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  Agent Name
                </Typography>
              </Grid>
              <Grid item xs={6} md={9}>
                <Typography variant="body1">{property.agent_name}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  Address
                </Typography>
              </Grid>
              <Grid item xs={6} md={9}>
                <Typography variant="body1">{property.apt_number + ", " + property.building_name + ", " + property.neighbourhood}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  CheckIn Time
                </Typography>
              </Grid>
              <Grid item xs={6} md={9}>
                <Typography variant="body1">{property.default_checkin_time}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  CheckOut Time
                </Typography>
              </Grid>
              <Grid item xs={6} md={9}>
                <Typography variant="body1">{property.default_checkout_time}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  Location
                </Typography>
              </Grid>
              <Grid item xs={6} md={9}>
                <Typography variant="body1">{property.gmaps_link}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  Deposit Amount
                </Typography>
              </Grid>
              <Grid item xs={6} md={9}>
                <Typography variant="body1">{property.default_deposit_amount}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <br></br>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ marginBottom: "0.5rem" }}>
          <Grid item>
            <Typography variant="h5">All Bookings</Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={0}>
              <Button variant="outlined" color="primary" size="large" onClick={handleCreateClick}>
                Create Booking
              </Button>
            </Stack>
          </Grid>
        </Grid>
        {!isBookingsLoading ? (
          propertyBookings && propertyBookings.length > 0 && <BookingsDataGrid properties={propertyBookings} />
        ) : (
          <CircularProgress color="secondary" size={60} />
        )}
      </Container>
      <Dialog open={open} onClose={handleEditClose}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Property</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center" }}>Edit the property details:</DialogContentText>
          {editFormError && (
            <Typography color="error" ref={errorRef}>
              {editFormError}
            </Typography>
          )}
          <TextField autoFocus margin="dense" label="Name" type="text" fullWidth name="name" value={editProperty.name} onChange={handleChange} />
          <TextField margin="dense" label="Agent Name" type="text" fullWidth name="agent_name" value={editProperty.agent_name} onChange={handleChange} />
          <TextField
            margin="dense"
            label="Neighbourhood"
            type="text"
            fullWidth
            name="neighbourhood"
            value={editProperty.neighbourhood}
            onChange={handleChange}
          />
          <TextField margin="dense" label="Appartment Number" type="text" fullWidth name="apt_number" value={editProperty.apt_number} onChange={handleChange} />
          <TextField
            margin="dense"
            label="Building Name"
            type="text"
            fullWidth
            name="building_name"
            value={editProperty.building_name}
            onChange={handleChange}
          />
          <TextField margin="dense" label="Location link" type="url" fullWidth name="gmaps_link" value={editProperty.gmaps_link} onChange={handleChange} />
          <TextField
            margin="dense"
            label="Number of Cleaning Hours"
            type="number"
            fullWidth
            name="num_cleaning_hours"
            value={editProperty.num_cleaning_hours}
            onChange={handleChange}
            inputProps={{
              min: 0,
            }}
          />
          <TextField
            margin="dense"
            label="Number of Bedrooms"
            type="number"
            fullWidth
            name="num_bedrooms"
            value={editProperty.num_bedrooms}
            onChange={handleChange}
            inputProps={{
              min: 0,
            }}
          />
          <TextField
            margin="dense"
            label="Number of Cleaners"
            type="number"
            fullWidth
            name="num_cleaners"
            value={editProperty.num_cleaners}
            onChange={handleChange}
            inputProps={{
              min: 0,
            }}
          />
          <TextField
            margin="dense"
            label="CheckIn Time"
            type="time"
            fullWidth
            name="default_checkin_time"
            value={editProperty.default_checkin_time}
            onChange={handleChange}
            inputProps={{
              step: 300, // 5 minutes step
            }}
          />
          <TextField
            margin="dense"
            label="CheckOut Time"
            type="time"
            fullWidth
            name="default_checkout_time"
            value={editProperty.default_checkout_time}
            onChange={handleChange}
            inputProps={{
              step: 300, // 5 minutes step
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Create Booking Form */}
      <Dialog open={createFormOpen} onClose={handleCreateClose}>
        <DialogTitle>Create Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the booking details:</DialogContentText>
          {createFormError && (
            <Typography color="error" ref={errorRef1}>
              {createFormError}
            </Typography>
          )}
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            name="start_date"
            value={newBooking.start_date}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            onChange={handleCreateChange}
            required
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            name="end_date"
            value={newBooking.end_date}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: newBooking.start_date,
            }}
            onChange={handleCreateChange}
            required
          />

          <TextField
            margin="dense"
            label="CheckIn Time"
            type="time"
            fullWidth
            name="checkin_time"
            value={newBooking.checkin_time}
            onChange={handleCreateChange}
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
            name="checkout_time"
            value={newBooking.checkout_time}
            onChange={handleCreateChange}
            inputProps={{
              step: 300, // 5 minutes step
            }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={() => handleCreateSubmit()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  ) : (
    <div>{error && <Typography color="error">{error}</Typography>}</div>
  );
};

export default Property;
