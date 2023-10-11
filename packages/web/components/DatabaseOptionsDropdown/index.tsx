import Btn from "@components/Btn";
import Popup from "@components/Popup";
import useEffectOnMount from "@hooks/useEffectOnMount";
import fakeEscapePress from "@lib/fakeEscapePress";
import { SqlQueryParams } from "@lib/params";
import { isMutation } from "@lib/parseSqlQuery";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import { RiFileDownloadLine } from "@react-icons/all-files/ri/RiFileDownloadLine";
import cx from "classnames";
import { ReactNode, useState } from "react";
import CsvModal from "./CsvModal";
import css from "./index.module.css";

type Props = {
  // onClickHideUnchangedCol?: () => void;
  // showingHideUnchangedCol?: boolean;
  children?: JSX.Element | null;
  className?: string;
  params?: SqlQueryParams;
};

export default function DatabaseOptionsDropdown({
  // onClickHideUnchangedCol,
  ...props
}: Props): JSX.Element | null {
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  useEffectOnMount(() => {
    document.addEventListener("wheel", fakeEscapePress);
    return () => document.removeEventListener("wheel", fakeEscapePress);
  });

  if (!props.children && !props.params) return null;
  if (props.params && isMutation(props.params.q)) return null;

  return (
    <div
      className={cx(css.optionsDropdown, props.className)}
      data-cy="db-options-dropdown"
    >
      <Popup
        position="bottom right"
        keepTooltipInside
        on={["click"]}
        contentStyle={{ width: "fit-content" }}
        offsetX={9}
        closeOnDocumentClick
        closeOnEscape
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        trigger={
          <div>
            <Btn data-cy="options-button" className={css.button}>
              <span className={css.caret}>
                {open ? <FaCaretUp /> : <FaCaretDown />}
              </span>
              <span>Options</span>
            </Btn>
          </div>
        }
        open={open}
      >
        <div>
          <ul>
            {/* {onClickHideUnchangedCol && (
              <DropdownItem
                data-cy="toggle-trim-button"
                onClick={() => {
                  onClickHideUnchangedCol();
                  fakeEscapePress();
                }}
                icon={
                  <div className={css.iconsDiv}>
                    {props.showingHideUnchangedCol ? (
                      <CgArrowsH />
                    ) : (
                      <CgCompress />
                    )}
                  </div>
                }
              >
                <>
                  {props.showingHideUnchangedCol ? "Show" : "Hide"} unchanged
                  columns
                </>
              </DropdownItem>
            )} */}
            {props.params && (
              <DropdownItem
                data-cy="open-download-csv-modal-button"
                onClick={() => {
                  setOpen(false);
                  setModalOpen(true);
                }}
                icon={
                  <div className={css.iconsDiv}>
                    <RiFileDownloadLine />
                  </div>
                }
              >
                Download query results as CSV
              </DropdownItem>
            )}
            {props.children}
          </ul>
        </div>
      </Popup>
      {props.params && (
        <CsvModal
          params={props.params}
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
        />
      )}
    </div>
  );
}

type ItemProps = {
  children: JSX.Element | string;
  icon: ReactNode;
  onClick?: () => void;
  ["data-cy"]?: string;
};

export function DropdownItem(props: ItemProps) {
  return (
    <li className={css.option}>
      <Btn
        onClick={props.onClick}
        className={css.optionButton}
        data-cy={props["data-cy"]}
      >
        <span>{props.icon}</span>
        {props.children}
      </Btn>
    </li>
  );
}
