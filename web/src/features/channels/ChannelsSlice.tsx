import { createSlice, PayloadAction  } from "@reduxjs/toolkit";
import { RootState } from "store/store";
import { AndClause, FilterClause } from "features/sidebar/sections/filter/filter";
import { SortByOptionType } from "features/sidebar/sections/sort/SortSectionOld";
import { ColumnMetaData } from "features/table/Table";


export const channelsColumns: ColumnMetaData[] = [
    {
      heading: "Status",
      type: "BooleanCell",
      key: "active",
      valueType: "boolean",
    },
    {
      heading: "Short Channel ID",
      type: "TextCell",
      key: "shortChannelId",
      valueType: "string",
    },
    {
      heading: "Gauge",
      type: "BarCell",
      key: "gauge",
      valueType: "number",
    },
    {
      heading: "Local Balance",
      type: "NumericCell",
      key: "localBalance",
      valueType: "number",
    },
    {
      heading: "Capacity",
      type: "NumericCell",
      key: "capacity",
      valueType: "number",
    },
    {
      heading: "Satoshis Sent",
      type: "NumericCell",
      key: "totalSatoshisSent",
      valueType: "number",
    },
    {
      heading: "Satoshis Received",
      type: "NumericCell",
      key: "totalSatoshisReceived",
      valueType: "number",
    },
    {
      heading: "Remote Balance",
      type: "NumericCell",
      key: "remoteBalance",
      valueType: "number",
    },
    {
      heading: "Pending HTLCs",
      type: "NumericCell",
      key: "pendingHtlcs",
      valueType: "number",
    },
    {
      heading: "Unsettled Balance",
      type: "NumericCell",
      key: "unsettledBalance",
      valueType: "number",
    },
    {
      heading: "Commit Fee",
      type: "NumericCell",
      key: "commitFee",
      valueType: "number",
    },
    {
      heading: "LND Short Channel ID",
      type: "TextCell",
      key: "lndShortChannelId",
      valueType: "string",
    },
    {
      heading: "LND Channel Point",
      type: "TextCell",
      key: "lndChannelPoint",
      valueType: "string",
    },
    {
      heading: "Local Node ID",
      type: "NumericCell",
      key: "localNodeId",
      valueType: "number",
    },
];

export interface ViewInterface {
    title: string;
    id?: number;
    saved: boolean;
    filters?: any;
    columns: ColumnMetaData[];
    sortBy: SortByOptionType[];
    groupBy?: string;
}


export interface TableChannelsState {
    channels: [];
    views: ViewInterface[];
    status: "idle" | "loading" | "failed";
}

const defaultFilter = new AndClause();
    defaultFilter.addChildClause(
        new FilterClause({
        funcName: "eq",
        category: "boolean",
        key: "active",
        parameter: true,
    })
);

export const DefaultView: ViewInterface = {
    title: "Untitled View",
    saved: true,
    columns: channelsColumns.filter((c) =>
      [
        "active",
        "shortChannelId",
        "gauge",
        "localBalance",
        "capacity",
        "totalSatoshisSent",
        "totalSatoshisReceived",
        "pendingHtlcs",
        "unsettledBalance",
        "remoteBalance",
        "commitFee",
        "localNodeId",
      ].includes(c.key)
    ),
    filters: defaultFilter.toJSON(),
    sortBy: [{ value: "Capacity", label: "Capacity", direction: "desc" }],
    groupBy: undefined,
};

const initialState: TableChannelsState = {
    channels: [],
    views: [
      {
        ...DefaultView,
        title: "Default View",
      },
    ],
    status: "idle",
  };

  export interface viewOrderInterface {
    id: number | undefined;
    view_order: number;
  }

  export const channelsSlice = createSlice({
    name: "channels",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
      updateFilters: (state, actions: PayloadAction<{ filters: any }>) => {
        state.views[0].filters = actions.payload.filters;
      },
      updateColumns: (state, actions: PayloadAction<{ columns: ColumnMetaData[] }>) => {
        state.views[0].columns = actions.payload.columns;
      },
      updateGroupBy: (state, actions: PayloadAction<{ groupBy: string }>) => {
        state.views[0].groupBy = actions.payload.groupBy;
      },
      updateSortBy: (state, actions: PayloadAction<{ sortBy: SortByOptionType[] }>) => {
        state.views[0].sortBy = actions.payload.sortBy;
      },
    },
});

export const {
    updateFilters,
    updateSortBy,
    updateColumns,
    updateGroupBy,
  } = channelsSlice.actions;

  export const selectActiveColumns = (state: RootState) => {
    return state.channels.views[0].columns || [];
  };
  export const selectAllColumns = (_: RootState) => channelsColumns;
  export const selectSortBy = (state: RootState) => state.channels.views[0].sortBy;
  export const selectGroupBy = (state: RootState) => state.channels.views[0].groupBy;
  export const selectFilters = (state: RootState) => {
    return state.channels.views[0].filters;
  };
  export const selectViews = (state: RootState) => state.channels.views;
  export const selectCurrentView = (state: RootState) => state.channels.views[0];
  export const selectStatus = (state: RootState) => state.channels.status;
  
  export default channelsSlice.reducer;