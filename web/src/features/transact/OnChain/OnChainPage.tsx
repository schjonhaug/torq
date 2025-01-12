import Table from "features/table/Table";
import { useGetOnChainTxQuery } from "./onChainApi";
import { Link, useNavigate } from "react-router-dom";
import {
  Options20Regular as OptionsIcon,
  LinkEdit20Regular as NewOnChainAddressIcon,
  // Save20Regular as SaveIcon,
} from "@fluentui/react-icons";
import TablePageTemplate, {
  TableControlSection,
  TableControlsButtonGroup,
  TableControlsButton,
  TableControlsTabsGroup,
} from "features/templates/tablePageTemplate/TablePageTemplate";
import { useState } from "react";
import Button, { buttonColor } from "components/buttons/Button";
import { NEW_ADDRESS } from "constants/routes";
import { useLocation } from "react-router";
import useTranslations from "services/i18n/useTranslations";
import { OnChainResponse, OnChainTx } from "./types";
import DefaultCellRenderer from "features/table/DefaultCellRenderer";
import {
  AllOnChainColumns,
  DefaultOnChainView,
  FilterableOnChainColumns,
  OnChainFilterTemplate,
  OnChainSortTemplate,
  SortableOnChainColumns,
} from "./onChainDefaults";
import { usePagination } from "components/table/pagination/usePagination";
import { useGetTableViewsQuery } from "features/viewManagement/viewsApiSlice";
import { useAppSelector } from "store/hooks";
import { selectOnChainView } from "features/viewManagement/viewSlice";
import ViewsSidebar from "features/viewManagement/ViewsSidebar";

function useMaximums(data: Array<OnChainTx>): OnChainTx | undefined {
  if (!data.length) {
    return undefined;
  }

  return data.reduce((prev: OnChainTx, current: OnChainTx, currentIndex: number) => {
    return {
      ...prev,
      alias: "Max",
      amount: Math.max(prev.amount, current.amount),
      totalFees: Math.max(prev.totalFees, current.totalFees),
      txHash: Math.max(prev.txHash, current.txHash),
    };
  });
}

function OnChainPage() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();

  const { isSuccess } = useGetTableViewsQuery<{ isSuccess: boolean }>();
  const { viewResponse, selectedViewIndex } = useAppSelector(selectOnChainView);
  const [getPagination, limit, offset] = usePagination("onChain");

  const onChainTxResponse = useGetOnChainTxQuery<{
    data: OnChainResponse;
    isLoading: boolean;
    isFetching: boolean;
    isUninitialized: boolean;
    isSuccess: boolean;
  }>(
    {
      limit: limit,
      offset: offset,
      order: viewResponse.view.sortBy,
      filter: viewResponse.view.filters ? viewResponse.view.filters : undefined,
    },
    { skip: !isSuccess }
  );

  // Logic for toggling the sidebar
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const closeSidebarHandler = () => {
    setSidebarExpanded(false);
  };

  const maxRow = useMaximums(onChainTxResponse.data?.data || []);

  const tableControls = (
    <TableControlSection>
      <TableControlsButtonGroup>
        <TableControlsTabsGroup>
          <Button
            buttonColor={buttonColor.green}
            text={t.newAddress}
            icon={<NewOnChainAddressIcon />}
            className={"collapse-tablet"}
            onClick={() => {
              navigate(NEW_ADDRESS, { state: { background: location } });
            }}
          />
        </TableControlsTabsGroup>
        <TableControlsButton
          onClickHandler={() => setSidebarExpanded(!sidebarExpanded)}
          icon={OptionsIcon}
          id={"tableControlsButton"}
        />
      </TableControlsButtonGroup>
    </TableControlSection>
  );

  const sidebar = (
    <ViewsSidebar
      onExpandToggle={closeSidebarHandler}
      expanded={sidebarExpanded}
      viewResponse={viewResponse}
      selectedViewIndex={selectedViewIndex}
      allColumns={AllOnChainColumns}
      defaultView={DefaultOnChainView}
      filterableColumns={FilterableOnChainColumns}
      filterTemplate={OnChainFilterTemplate}
      sortableColumns={SortableOnChainColumns}
      sortByTemplate={OnChainSortTemplate}
    />
  );

  const breadcrumbs = [
    <span key="b1">{t.transactions}</span>,
    <Link key="b2" to={"/transactions/on-chain"}>
      {t.onChainTx}
    </Link>,
  ];

  return (
    <TablePageTemplate
      title={"OnChain"}
      breadcrumbs={breadcrumbs}
      sidebarExpanded={sidebarExpanded}
      sidebar={sidebar}
      tableControls={tableControls}
      pagination={getPagination(onChainTxResponse?.data?.pagination?.total || 0)}
    >
      <Table
        cellRenderer={DefaultCellRenderer}
        data={onChainTxResponse?.data?.data || []}
        activeColumns={viewResponse.view.columns}
        isLoading={onChainTxResponse.isLoading || onChainTxResponse.isFetching || onChainTxResponse.isUninitialized}
        maxRow={maxRow}
      />
    </TablePageTemplate>
  );
}

export default OnChainPage;
