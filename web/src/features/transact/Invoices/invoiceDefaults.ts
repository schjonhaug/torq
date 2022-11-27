import { ViewInterface } from "features/viewManagement/types";
import { Invoice } from "./invoiceTypes";
import { ColumnMetaData } from "features/table/types";
import { FilterInterface } from "../../sidebar/sections/filter/filter";

export const AllInvoicesColumns: Array<ColumnMetaData<Invoice>> = [
  {
    key: "creationDate",
    heading: "Creation Date",
    type: "DateCell",
    valueType: "date",
  },
  {
    key: "settleDate",
    heading: "Settle Date",
    type: "DateCell",
    valueType: "date",
  },
  {
    key: "invoiceState",
    heading: "State",
    type: "TextCell",
    valueType: "array",
  },
  {
    key: "amtPaid",
    heading: "Paid Amount",
    type: "NumericCell",
    valueType: "number",
  },
  {
    key: "memo",
    heading: "memo",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "value",
    heading: "Invoice Amount",
    type: "NumericCell",
    valueType: "number",
  },
  {
    key: "isRebalance",
    heading: "Rebalance",
    type: "BooleanCell",
    valueType: "boolean",
  },
  {
    key: "isKeysend",
    heading: "Keysend",
    type: "BooleanCell",
    valueType: "boolean",
  },
  {
    key: "destinationPubKey",
    heading: "Destination",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "isAmp",
    heading: "AMP",
    type: "BooleanCell",
    valueType: "boolean",
  },
  {
    key: "fallbackAddr",
    heading: "Fallback Address",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "paymentAddr",
    heading: "Payment Address",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "paymentRequest",
    heading: "Payment Request",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "private",
    heading: "Private",
    type: "BooleanCell",
    valueType: "boolean",
  },
  {
    key: "rHash",
    heading: "Hash",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "rPreimage",
    heading: "Preimage",
    type: "TextCell",
    valueType: "string",
  },
  {
    key: "expiry",
    heading: "Expiry",
    type: "NumericCell",
    valueType: "number",
  },
  {
    key: "cltvExpiry",
    heading: "CLTV Expiry",
    type: "NumericCell",
    valueType: "number",
  },
  {
    key: "updatedOn",
    heading: "Updated On",
    type: "DateCell",
    valueType: "date",
  },
];

const defaultKeys: Array<keyof Invoice> = [
  "creationDate",
  "settleDate",
  "invoiceState",
  "amtPaid",
  "memo",
  "value",
  "isRebalance",
  "isKeysend",
  "destinationPubKey",
];

export const DefaultInvoicesColumns = AllInvoicesColumns.filter(({ key }) => defaultKeys.includes(key));

const sortableKeys: Array<keyof Invoice> = [
  "creationDate",
  "settleDate",
  "invoiceState",
  "amtPaid",
  "memo",
  "value",
  "isRebalance",
  "isKeysend",
  "destinationPubKey",
  "isAmp",
  "fallbackAddr",
  "paymentAddr",
  "paymentRequest",
  "private",
  "expiry",
  "cltvExpiry",
  "updatedOn",
];

export const SortableInvoiceColumns = AllInvoicesColumns.filter((column: ColumnMetaData<Invoice>) => {
  return sortableKeys.includes(column.key);
});

export const DefaultSortValue: { key: keyof Invoice; direction: "desc" | "asc" } = {
  key: "value",
  direction: "desc",
};

export const DefaultFilter: FilterInterface = {
  key: "value",
  funcName: "gte",
  parameter: 0,
  category: "number",
};

// const filterColumns = clone(allColumns).map((c: any) => {
//   switch (c.key) {
//     case "invoiceState":
//       c.selectOptions = Object.keys(statusTypes).map((key: any) => {
//         return {
//           value: key,
//           label: statusTypes[String(key)],
//         };
//       });
//       break;
//   }
//   return c;
// });

export const InvoiceViewTemplate: ViewInterface<Invoice> = {
  title: "Untitled View",
  saved: true,
  columns: DefaultInvoicesColumns,
  page: "invoices",
  sortBy: [],
  view_order: 0,
};
