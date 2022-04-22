import styles from './cell.module.scss'
const classNames = require('classnames');

interface AliasCell {
  current: string,
  open?: boolean,
  className?: string
}

function AliasCell({current, open, className}: AliasCell) {
  return (
    <div className={classNames(styles.cell, styles.alignLeft, className)}>
      <div className={styles.current}>
        {current}
      </div>
      <div className={styles.past}>
        {/*{open ? 'Open' : 'Closed'}*/}
        {'-'}
      </div>
    </div>
  )
}

export default AliasCell;