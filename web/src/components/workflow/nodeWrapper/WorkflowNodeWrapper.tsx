import useTranslations from "services/i18n/useTranslations";
import styles from "./workflow_nodes.module.scss";
import React, { createRef, MutableRefObject, useContext, useId, useRef, useState } from "react";
import classNames from "classnames";
import NodeConnector from "./NodeConnector";
import { CanvasContext } from "components/workflow/canvas/WorkflowCanvas";
import { ExpandUpRight16Regular as ExpandIcon, ContractDownLeft16Regular as CollapseIcon } from "@fluentui/react-icons";
// import { ChevronDown16Regular as ExpandIcon, ChevronUp16Regular as CollapseIcon } from "@fluentui/react-icons";

type nodeRefType = { nodeRef: MutableRefObject<HTMLDivElement> | null; nodeName: string };
export const NodeContext = React.createContext<nodeRefType>({
  nodeRef: null,
  nodeName: "",
});

export type WorkflowNodeProps = {
  id: string;
  nodeName: string;
  heading?: string;
  children?: React.ReactNode;
  x?: number;
  y?: number;
};

function WorkflowNodeWrapper<T>(props: WorkflowNodeProps) {
  const { t } = useTranslations();
  const [collapsed, setCollapsed] = useState(true);
  const [position, setPosition] = useState({ x: props.x || 50, y: props.y || 50 });
  const [bodyStyle, setBodyStyle] = useState({ height: "0px", overflow: "hidden" });

  // Canvas and blankRef are used to calculate the position of the node. They are passed down from the canvas
  const { canvasRef, blankImgRef } = useContext(CanvasContext);

  // nodeRef is used by the NodeConnector to allow for drag and drop interaction between nodes.
  const nodeRef = createRef() as MutableRefObject<HTMLDivElement>;

  const nodeBodyRef = createRef() as MutableRefObject<HTMLDivElement>;

  const headerRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [nodeBB, setNodeBB] = useState({ left: 0, top: 0 });
  const [isDragging, setIsDragging] = useState(false);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    // Set the drag effect and remove the default drag image set by HTML5
    e.dataTransfer.setDragImage(blankImgRef.current, 0, 0);
    e.dataTransfer.effectAllowed = "move";

    // Set the dragging state to true to allow for css changes
    setIsDragging(true);

    // This sets offsets the starting position of the node to the mouse position,
    // preventing the node from jumping to the mouse position when we drag it.
    const nodeBB = headerRef.current.getBoundingClientRect();
    const x = e.clientX - nodeBB.left;
    const y = e.clientY - nodeBB.top;
    setNodeBB({ left: x, top: y });
  }

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    // Get the position of the canvas
    const bb = canvasRef?.current !== undefined || null ? canvasRef.current.getBoundingClientRect() : { x: 0, y: 0 };

    if (e.clientX !== 0 && e.clientY !== 0) {
      // Calculate the new position of the node based on the mouse position (e.clientX/Y),
      // the top left position of the canvas (bb.x/y) and the top left position of the node (nodeBB.x/y)
      const newX = e.clientX - bb.x - nodeBB.left;
      const newY = e.clientY - bb.y - nodeBB.top;
      setPosition({ x: newX, y: newY });
    }
  }

  function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    setIsDragging(false);
  }

  const connectorId = useId();

  function handleCollapse() {
    // Toggle the collapsed state
    setCollapsed(!collapsed);

    // The bounding box of the child element will always be there even if the parrent height is 0px.
    // This allows us to use the currenty bounding box to set the height of the parrent.
    const bb = nodeBodyRef.current.getBoundingClientRect();

    if (collapsed) {
      // Expand the body conetent by setting the body wrapper to the current height of the body.
      setBodyStyle({ height: bb.height + "px", overflow: "hidden" });

      // Wait before applying the overflow property to avoid content becoming visible too early,
      // but still allowing dropdowns etc. to show. We also want to set the height to auto, so that
      // the content can expand to fit the available space.
      setTimeout(() => {
        setBodyStyle({ height: "auto", overflow: "visible" });
      }, 250);
    } else {
      // Since we set the height to auto, we need to set it to the current height and wait 1ms before we can transition
      // to 0px. If not, then the transition will not work and the box size jumps streight to 0.
      setBodyStyle({ height: bb.height + "px", overflow: "hidden" });
      setTimeout(() => {
        setBodyStyle({ height: "0px", overflow: "hidden" });
      }, 1);
    }
  }

  return (
    <NodeContext.Provider
      value={{
        nodeRef: nodeRef,
        nodeName: props.nodeName,
      }}
    >
      <div
        id={props.id}
        className={classNames(styles.workflowNodeCard, {
          [styles.dragging]: isDragging,
        })}
        style={{ transform: "translate(" + position.x + "px, " + position.y + "px)" }}
        ref={nodeRef}
      >
        <div
          className={classNames(styles.workflowNodeHeader, { [styles.headerCollapsed]: collapsed })}
          draggable="true"
          onDrag={handleDrag}
          ref={headerRef}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleCollapse}
        >
          <div>{props.heading + ": " + props.nodeName}</div>
          {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          <NodeConnector id={connectorId} name={props.nodeName} />
        </div>
        <div className={classNames(styles.workflowNodeBodyWrapper)} style={bodyStyle}>
          <div className={styles.workflowNodeBody} ref={nodeBodyRef}>
            {props.children}
          </div>
        </div>
      </div>
    </NodeContext.Provider>
  );
}

export default WorkflowNodeWrapper;
