import React, { useState } from "react";
import { Button, Icon, Modal, Dropdown } from "semantic-ui-react";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import { createSlots } from "../../utils/slots";

function createData(subject, day, slot) {
  return { subject, day, slot };
}

function ModalExampleMultiple({
  firstOpen,
  secondOpen,
  setFirstOpen,
  setSecondOpen,
  setRows,
  notAvailableSlots,
}) {
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const timeSlots = Array.from(new Array(24)).map(
    (_, index) =>
      `${index < 10 ? "0" : ""}${index}:00 - ${index < 10 ? "0" : ""}${
        index !== 23 ? index + 1 : "00"
      }:00`
  );
  const handleSubmit = async () => {
    setLoading(true);
    const responseSlots = await createSlots(
      slots.map((slot) => createData(subject, day, slot))
    );
    setRows(responseSlots.slots);
    setSecondOpen(false);
    setFirstOpen(false);
    setDay("");
    setSubject("");
    setSlots([]);
    setLoading(false);
  };
  return (
    <>
      <Modal
        onClose={() => setFirstOpen(false)}
        onOpen={() => setFirstOpen(true)}
        open={firstOpen}
      >
        <Modal.Header>Select a course</Modal.Header>
        <Modal.Content image>
          <div className="image">
            <Icon name="right arrow" />
          </div>
          <Modal.Description>
            <p>
              Choose a course from the following dropdown that you want to teach
            </p>
            <Dropdown
              value={subject}
              onChange={(e, data) => {
                setSubject(data.value);
              }}
              placeholder="Select a course"
              fluid
              selection
              options={[
                { key: "Python", text: "Python", value: "Python" },
                { key: "Javascript", text: "Javascript", value: "Javascript" },
                { key: "C++", text: "C++", value: "C++" },
                { key: "Java", text: "Java", value: "Java" },
              ]}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={subject === ""}
            onClick={() => {
              setSecondOpen(true);
            }}
            primary
          >
            Proceed <Icon name="right chevron" />
          </Button>
        </Modal.Actions>

        <Modal
          onClose={() => setSecondOpen(false)}
          open={secondOpen}
          size="small"
        >
          <Modal.Header>Select day and slot</Modal.Header>
          <Modal.Content>
            <p>Choose the day and slots when you want to teach {subject}</p>
            <Dropdown
              placeholder="Day"
              selection
              value={day}
              style={{ height: "53px" }}
              onChange={(e, data) => setDay(data.value)}
              options={[
                { key: "Sunday", text: "Sunday", value: "Sunday" },
                { key: "Monday", text: "Monday", value: "Monday" },
                { key: "Tuesday", text: "Tuesday", value: "Tuesday" },
                { key: "Wednesday", text: "Wednesday", value: "Wednesday" },
                { key: "Thursday", text: "Thursday", value: "Thursday" },
                { key: "Friday", text: "Friday", value: "Friday" },
                { key: "Saturday", text: "Saturday", value: "Saturday" },
              ]}
            />
            <Autocomplete
              multiple
              id="checkboxes-tags-demo"
              options={timeSlots}
              value={slots}
              onChange={(e, newValue) => setSlots(newValue)}
              disableCloseOnSelect
              getOptionDisabled={(option) =>
                notAvailableSlots.filter(
                  (row) =>
                    row.slot === option &&
                    row.subject === subject &&
                    row.day === day
                ).length > 0
              }
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
                    checked={selected}
                  />
                  {option}
                </React.Fragment>
              )}
              style={{ width: 450, float: "right" }}
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
          </Modal.Content>
          <Modal.Actions>
            <Button
              icon="check"
              loading={loading}
              disabled={day === "" || (slots && slots.length === 0)}
              content="Add slots"
              onClick={handleSubmit}
            />
          </Modal.Actions>
        </Modal>
      </Modal>
    </>
  );
}

export default ModalExampleMultiple;
