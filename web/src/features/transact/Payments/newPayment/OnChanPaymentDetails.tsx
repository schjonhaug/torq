import { Options20Regular as OptionsIcon } from "@fluentui/react-icons";
import Button, { buttonColor, ButtonWrapper } from "features/buttons/Button";
import { useState } from "react";
import TextInput from "features/forms/TextInput";
import { ProgressStepState } from "features/progressTabs/ProgressHeader";
import { ProgressTabContainer } from "features/progressTabs/ProgressTab";
import { SectionContainer } from "features/section/SectionContainer";
import NumberFormat, { NumberFormatValues } from "react-number-format";

import styles from "./newPayments.module.scss";
import { PaymentType, PaymentTypeLabel } from "./types";
import { MutationTrigger } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, MutationDefinition } from "@reduxjs/toolkit/query";
import { SendOnChainRequest } from "../../../../types/api";

type BtcStepProps = {
  sendCoinsMutation: MutationTrigger<
    MutationDefinition<
      SendOnChainRequest,
      BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
      "channels" | "settings" | "tableView" | "localNodes",
      any,
      "api"
    >
  >;
  amount: number;
  setAmount: (amount: number) => void;
  destinationType: PaymentType;
  destination: string;
  setStepIndex: (index: number) => void;
  setDestState: (state: ProgressStepState) => void;
  setConfirmState: (state: ProgressStepState) => void;
  setProcessState: (state: ProgressStepState) => void;
};

export default function OnChanPaymentDetails(props: BtcStepProps) {
  const [expandAdvancedOptions, setExpandAdvancedOptions] = useState(false);
  const [satPerVbyte, setSatPerVbyte] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  // const [onChainPaymentResponse, setOnChainPaymentResponse] = useState<{ txId: string }>();

  return (
    <ProgressTabContainer>
      <div className={styles.amountWrapper}>
        <span className={styles.destinationType}>{PaymentTypeLabel[props.destinationType] + " Detected"}</span>
        <div className={styles.amount}>
          <NumberFormat
            className={styles.amountInput}
            suffix={" sat"}
            thousandSeparator=","
            value={props.amount}
            placeholder={"0 sat"}
            onValueChange={(values: NumberFormatValues) => {
              props.setAmount(values.floatValue || 0);
            }}
          />
        </div>
        <div className={styles.label}>To</div>
        <div className={styles.destinationPreview}>{props.destination}</div>
      </div>
      <div className={styles.destinationWrapper}>
        <div className={styles.labelWrapper}>
          <label htmlFor={"destination"} className={styles.destinationLabel}>
            Description (only seen by you)
          </label>
        </div>
        <textarea
          id={"lnDescription"}
          name={"lnDescription"}
          className={styles.destinationTextArea}
          autoComplete="off"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          rows={3}
        />
      </div>
      <SectionContainer
        title={"Advanced Options"}
        icon={OptionsIcon}
        expanded={expandAdvancedOptions}
        handleToggle={() => {
          setExpandAdvancedOptions(!expandAdvancedOptions);
        }}
      >
        <TextInput
          label={"Sat per vByte"}
          value={satPerVbyte}
          onChange={(value) => {
            setSatPerVbyte(value as number);
          }}
        />
      </SectionContainer>

      <ButtonWrapper
        className={styles.customButtonWrapperStyles}
        leftChildren={
          <Button
            text={"Back"}
            onClick={() => {
              props.setStepIndex(0);
              props.setDestState(ProgressStepState.completed);
              props.setConfirmState(ProgressStepState.active);
            }}
            buttonColor={buttonColor.ghost}
          />
        }
        rightChildren={
          <Button
            text={"Confirm"}
            onClick={() => {
              props.setStepIndex(2);
              props.setConfirmState(ProgressStepState.completed);
              props.setProcessState(ProgressStepState.processing);
              props.sendCoinsMutation({
                addr: props.destination,
                nodeId: 1,
                amountSat: props.amount,
              });
            }}
            buttonColor={buttonColor.green}
          />
        }
      />
    </ProgressTabContainer>
  );
}
