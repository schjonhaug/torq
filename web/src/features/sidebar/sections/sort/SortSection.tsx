import { memo, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Delete16Regular as DismissIcon,
  ReOrder16Regular as ReOrderIcon,
  AddSquare20Regular as AddIcon,
  ArrowSortDownLines16Regular as SortDescIcon,
} from "@fluentui/react-icons";
import DropDown from "./SortDropDown";
import DefaultButton from "features/buttons/Button";
import { ColumnMetaData } from "features/table/Table";
import styles from "./sort.module.scss";
import classNames from "classnames";
import { ActionMeta } from "react-select";

interface sortDirectionOption {
  value: string;
  label: string;
}

export type OrderBy = {
  key: string;
  direction: "asc" | "desc";
};

type OrderByOption = {
  value: string;
  label: string;
};

type SortRowProps = {
  selected: OrderBy;
  options: Array<OrderByOption>;
  index: number;
  handleUpdateSort: Function;
  handleRemoveSort: Function;
};

const SortRow = ({ selected, options, index, handleUpdateSort, handleRemoveSort }: SortRowProps) => {
  const handleColumn = (newValue: any, actionMeta: ActionMeta<unknown>) => {
    handleUpdateSort({ key: newValue.value, direction: selected.direction }, index);
  };
  const updateDirection = (selected: OrderBy) => {
    handleUpdateSort(
      {
        ...selected,
        direction: selected.direction === "asc" ? "desc" : "asc",
      },
      index
    );
  };

  return (
    <Draggable draggableId={`draggable-sort-id-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          className={classNames(styles.sortRow, {
            dragging: snapshot.isDragging,
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div {...provided.dragHandleProps} className={styles.dragHandle}>
            <ReOrderIcon />
          </div>
          <div className={styles.labelWrapper}>
            {/*{selected.label}*/}
            <DropDown
              onChange={handleColumn}
              options={options}
              getOptionLabel={(option: any): string => option["label"]}
              getOptionValue={(option: any): string => option["value"]}
              value={options.find((option) => option.value === selected.key)}
            />
          </div>

          <div
            className={classNames(styles.directionWrapper, { [styles.asc]: selected.direction === "asc" })}
            onClick={() => updateDirection(selected)}
          >
            {<SortDescIcon />}
          </div>
          <div className={styles.dismissIconWrapper}>
            <DismissIcon
              onClick={() => {
                handleRemoveSort(index);
              }}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

type SortSectionProps = {
  columns: Array<ColumnMetaData>;
  orderBy: Array<OrderBy>;
  updateHandler: (orderBy: Array<OrderBy>) => void;
};

const SortSection = (props: SortSectionProps) => {
  const [options, selected] = useMemo(() => {
    let options: Array<OrderByOption> = [];
    let selected: Array<OrderByOption> = [];

    props.columns.slice().forEach((column: { key: string; heading: string }) => {
      options.push({
        value: column.key,
        label: column.heading,
      });
    });
    return [options, selected];
  }, [props.columns]);

  const handleAddSort = () => {
    const updated: Array<OrderBy> = [
      ...props.orderBy,
      {
        direction: "desc",
        key: props.columns[0].key,
      },
    ];
    props.updateHandler(updated);
  };

  const handleUpdateSort = (update: OrderBy, index: number) => {
    const updated: Array<OrderBy> = [
      ...props.orderBy.slice(0, index),
      update,
      ...props.orderBy.slice(index + 1, props.orderBy.length),
    ];
    props.updateHandler(updated);
  };

  const handleRemoveSort = (index: number) => {
    const updated: OrderBy[] = [
      ...props.orderBy.slice(0, index),
      ...props.orderBy.slice(index + 1, props.orderBy.length),
    ];
    props.updateHandler(updated);
  };

  const droppableContainerId = "sort-list-droppable";

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Dropped outside of container
    if (!destination || destination.droppableId !== droppableContainerId) {
      return;
    }

    // Position not changed
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    let newSortsOrder = props.orderBy.slice();
    newSortsOrder.splice(source.index, 1);
    newSortsOrder.splice(destination.index, 0, props.orderBy[source.index]);
    props.updateHandler(newSortsOrder);
  };

  return (
    <DragDropContext
      // onDragStart={}
      // onDragUpdate={}
      onDragEnd={onDragEnd}
    >
      <div className={styles.sortPopoverContent}>
        {!props.orderBy.length && <div className={styles.noFilters}>Not sorted</div>}

        {!!props.orderBy.length && (
          <Droppable droppableId={droppableContainerId}>
            {(provided) => (
              <div className={styles.sortRows} ref={provided.innerRef} {...provided.droppableProps}>
                {props.orderBy.map((item, index) => {
                  return (
                    <SortRow
                      key={item.key + index}
                      selected={item}
                      options={options}
                      index={index}
                      handleUpdateSort={handleUpdateSort}
                      handleRemoveSort={handleRemoveSort}
                    />
                  );
                })}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}

        <div className={styles.buttonsRow}>
          <DefaultButton className={"small"} onClick={() => handleAddSort()} text={"Add"} icon={<AddIcon />} />
        </div>
      </div>
    </DragDropContext>
  );
};

export default SortSection;