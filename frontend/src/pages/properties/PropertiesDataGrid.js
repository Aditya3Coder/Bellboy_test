import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link as RouterLink } from "react-router-dom";
import { Link, Stack, Typography } from "@mui/material";
import Dot from "components/@extended/Dot";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import CustomSnackbar from "components/Snackbar";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
// Properties table Headings
const headCells = [
  {
    id: "id",
    align: "center",
    disablePadding: false,
    label: "ID",
  },
  {
    id: "name",
    align: "left",
    disablePadding: true,
    label: "Name",
  },
  {
    id: "address",
    align: "left",
    disablePadding: false,
    label: "Address",
  },
  {
    id: "occupation_status",
    align: "left",
    disablePadding: false,
    label: "Occupation Status",
  },
  {
    id: "cleaning_status",
    align: "left",
    disablePadding: false,
    label: "Cleaning Status",
  },
  {
    id: "default_deposit_amount",
    align: "left",
    disablePadding: false,
    label: "Deposit Amount",
  },
  {
    id: "uuid",
    align: "center",
    disablePadding: false,
    label: "Magic Link",
  },
  {
    id: "action",
    align: "center",
    disablePadding: false,
    label: "Action",
  },
];
// Function return colored dot based on status
const OccupationStatus = ({ status }) => {
  let color;

  switch (status) {
    case "OCCUPIED":
      color = "warning";
      break;
    case "CHECKED OUT":
      color = "success";
      break;
    case "DELETED":
      color = "error";
      break;
    default:
      color = "primary";
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Dot color={color} />
      <Typography>{status}</Typography>
    </Stack>
  );
};

const CleaningStatus = ({ status }) => {
  let color;

  switch (status) {
    case "PENDING":
      color = "warning";
      break;
    case "ACCEPTED":
      color = "success";
      break;
    case "ENROUTE":
      color = "warning";
      break;
    case "ARRIVED":
      color = "warning";
      break;
    case "CLEANING":
      color = "warning";
      break;
    case "COMPLETED":
      color = "success";
      break;
    case "DECLINED":
      color = "error";
      break;
    default:
      color = "primary";
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      { status && <Dot color={color} /> }
      <Typography>{status}</Typography>
    </Stack>
  );
};

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}>
            {/* When heading is UUID or Action dont allow Sort */}
            {headCell.id === "uuid" || headCell.id === "action" ? (
              headCell.label
            ) : (
              <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"} onClick={createSortHandler(headCell.id)}>
                {headCell.label}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

export default function PropertiesDataGrid(props) {
  const rows = props.properties;
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("id");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const axios = useAxiosPrivate();

  async function CopyTextToClipboard(text) {
    try {
      const permissions = await navigator.permissions.query({ name: "clipboard-write" });
      if (permissions.state === "granted" || permissions.state === "prompt") {
        await navigator.clipboard.writeText(text);
        setSuccessMessage("Link Copied To Clipboard!");
      } else {
        setErrorMessage("Can't access the clipboard. Check your browser permissions!");
        // alert("Can't access the clipboard. Check your browser permissions.")
      }
    } catch (error) {
      setErrorMessage("Error copying to clipboard!");
      // alert('Error copying to clipboard:', error);
    }
  }
  const handleSnackbarClose = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  async function handleCheckOutButton(id) {
    try {
      const bookingResponse = await axios.patch(`/bookings/${id}/check-out`);
      setSuccessMessage("CheckOut success!");
      props.onBookingChange();
    } catch (error) {
      console.log(error);
      if(error.response?.data?.detail)
      {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage("There was an error in Checking Out this Booking.");
      }
    }
  }

  async function handleCheckInButton(id) {
    try {
      const bookingResponse = await axios.patch(`/bookings/${id}/check-in`);
      setSuccessMessage("CheckIn success!");
      props.onBookingChange();
    } catch (error) {
      console.log(error);
      if(error.response?.data?.detail)
      {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage("There was an error in Checking-In this Booking.");
      }
    }
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () => stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <CustomSnackbar message={successMessage} closeSnackbar={handleSnackbarClose} severity="success"/>
        <CustomSnackbar message={errorMessage} closeSnackbar={handleSnackbarClose} severity="error"/>
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            <TableBody>
              {visibleRows.map((row, index) => {
                return (
                  <TableRow hover tabIndex={-1} key={row.id}>
                    <TableCell align="center">
                      {row.id}
                      <Link color="primary" component={RouterLink} to={`/properties/${row.id}`} style={{ textDecoration: "underline", fontWeight: "bold" }}>
                        <OpenInNewIcon fontSize="small" style={{ marginLeft: "4px", verticalAlign: "middle" }} />
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">
                      <Link
                        color="primary"
                        onClick={() => CopyTextToClipboard(row.gmaps_link)}
                        style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}>
                        {row.apt_number}, {row.building_name}, {row.neighbourhood}
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      <OccupationStatus status={row.occupation_status} />
                    </TableCell>
                    <TableCell align="left">
                      <CleaningStatus status={row.cleaning_status} />
                    </TableCell>
                    <TableCell align="left">
                      {row.default_deposit_amount}
                    </TableCell>
                    <TableCell align="center">
                      {row.booking_uuid !== false ? (
                        <ContentCopyIcon
                          onClick={() => CopyTextToClipboard(`${window.location.host}/customer/${row.booking_uuid}`)}
                          fontSize="small"
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        ""
                      )}
                    </TableCell>
                    <TableCell align="center">
                      { row.occupation_status === "UPCOMING" ? (
                        <Button onClick={() => handleCheckInButton(row.id)} size="small" variant="contained">
                          Check In
                        </Button>
                        ) 
                        : row.occupation_status === "OCCUPIED" ? (
                          <Button onClick={() => handleCheckOutButton(row.id)} size="small" variant="contained">
                            Check Out
                          </Button>
                        ):(
                          ""
                        )
                      }
                      
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
