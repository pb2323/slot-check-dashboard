import React, { useState } from "react";
import PropTypes from "prop-types";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import { Button } from "semantic-ui-react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import Cookies from "js-cookie";

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
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: "teacher", numeric: false, label: "Teachers" },
  { id: "subject", numeric: false, label: "Subjects" },
  { id: "day", numeric: false, label: "Day" },
  { id: "slot", numeric: false, label: "Slot (24-hours)" },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const EnhancedTableToolbar = ({ user }) => {
  const classes = useToolbarStyles();

  return (
    <Toolbar>
      <Typography
        className={classes.title}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Hi {user.name}
      </Typography>
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: "10px",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

export default function EnhancedTable({ user, slots, errorLoading = false }) {
  const classes = useStyles();
  const [rows, setRows] = useState(errorLoading || !slots ? [] : slots);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("calories");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedDays, setSelectedDays] = useState(["Monday"]);
  const courses = ["Python", "Javascript", "C++", "Java"];
  const [selectedCourses, setSelectedCourses] = useState(courses);
  const [loading, setLoading] = useState(false);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
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

  const timeSlots = Array.from(new Array(24)).map(
    (_, index) =>
      `${index < 10 ? "0" : ""}${index}:00 - ${index < 10 ? "0" : ""}${
        index !== 23 ? index + 1 : "00"
      }:00`
  );
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([...timeSlots]);
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  const daySlots = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const handleSubmit = async () => {
    setLoading(true);
    const { data } = await axios.post(
      `${baseUrl}/api/slots/list`,
      {
        subjects: selectedCourses,
        days: selectedDays,
        selectedSlots: selectedTimeSlots,
      },
      { headers: { Authorization: Cookies.get("token") } }
    );
    setRows(data.slots);
    setLoading(false);
  };

  return (
    <>
      <Button
        loading={loading}
        style={{ float: "right", margin: "10px" }}
        onClick={handleSubmit}
        disabled={
          selectedTimeSlots.length === 0 ||
          selectedDays.length === 0 ||
          selectedCourses.length === 0
        }
        primary
      >
        Apply
      </Button>

      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={["Select All", ...timeSlots]}
        value={selectedTimeSlots}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        renderTags={(values, tagProps) =>
          values.length > 0 ? (
            <>
              <Chip label={values[0]} />
              {values.length > 1 ? `+${values.length - 1}` : null}
            </>
          ) : null
        }
        renderOption={(option, { selected }) => (
          <React.Fragment>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={
                selected || timeSlots.length === selectedTimeSlots.length
              }
            />
            {option}
          </React.Fragment>
        )}
        onChange={(event, newValue) => {
          let value = [];
          if (newValue.find((v) => v == "Select All")) {
            if (selectedTimeSlots.length !== timeSlots.length) {
              value = timeSlots;
            } else {
              value = [];
            }
          } else {
            value = newValue;
          }
          setSelectedTimeSlots(value);
        }}
        style={{ width: 240, float: "right", marginTop: "10px" }}
        renderInput={(params) => (
          <TextField
            {...params}
            style={{ height: "38px" }}
            variant="outlined"
            label="Time Slots"
            placeholder="Slots"
          />
        )}
      />
      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={["Select All", ...daySlots]}
        value={selectedDays}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        renderTags={(values, tagProps) =>
          values.length > 0 ? (
            <>
              <Chip label={values[0]} />
              {values.length > 1 ? `+${values.length - 1}` : null}
            </>
          ) : null
        }
        renderOption={(option, { selected }) => (
          <React.Fragment>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected || selectedDays.length === daySlots.length}
            />
            {option}
          </React.Fragment>
        )}
        style={{
          width: 200,
          float: "right",
          marginRight: "10px",
          marginTop: "10px",
        }}
        onChange={(event, newValue) => {
          let value = [];
          if (newValue.find((v) => v == "Select All")) {
            if (selectedDays.length !== daySlots.length) {
              value = daySlots;
            } else {
              value = [];
            }
          } else {
            value = newValue;
          }
          setSelectedDays(value);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            style={{ height: "38px" }}
            variant="outlined"
            label="Select Days"
            placeholder="Days"
          />
        )}
      />
      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={["Select All", ...courses]}
        value={selectedCourses}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        renderTags={(values, tagProps) =>
          values.length > 0 ? (
            <>
              <Chip label={values[0]} />
              {values.length > 1 ? `+${values.length - 1}` : null}
            </>
          ) : null
        }
        renderOption={(option, { selected }) => (
          <React.Fragment>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected || courses.length === selectedCourses.length}
            />
            {option}
          </React.Fragment>
        )}
        onChange={(event, newValue) => {
          let value = [];
          if (newValue.find((v) => v == "Select All")) {
            if (selectedCourses.length !== courses.length) {
              value = courses;
            } else {
              value = [];
            }
          } else {
            value = newValue;
          }
          setSelectedCourses(value);
        }}
        style={{
          width: 240,
          float: "right",
          marginTop: "10px",
          marginRight: "10px",
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            style={{ height: "38px" }}
            variant="outlined"
            label="Select Course"
            placeholder="Course"
          />
        )}
      />
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <EnhancedTableToolbar user={user} />
          <TableContainer>
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                classes={classes}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow hover tabIndex={-1} key={row._id}>
                        <TableCell align="left">{row.name}</TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          {row.subject}
                        </TableCell>
                        <TableCell align="left">{row.day}</TableCell>
                        <TableCell align="left">{row.slot}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
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
      </div>
    </>
  );
}
