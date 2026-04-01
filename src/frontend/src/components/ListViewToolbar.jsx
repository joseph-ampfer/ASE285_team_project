function ListViewToolbar({
  groupByStatus,
  onGroupByStatusChange,
  showCanvas,
  onShowCanvasChange,
  showNonCanvas,
  onShowNonCanvasChange,
}) {
  return (
    <div className="list-view-toolbar" role="group" aria-label="List filters">
      <label className="list-view-toolbar-label">
        <input
          type="checkbox"
          checked={groupByStatus}
          onChange={(e) => onGroupByStatusChange(e.target.checked)}
        />
        Group
      </label>
      <span className="list-view-toolbar-sep" aria-hidden />
      <label className="list-view-toolbar-label">
        <input
          type="checkbox"
          checked={showCanvas}
          onChange={(e) => onShowCanvasChange(e.target.checked)}
        />
        Canvas
      </label>
      <label className="list-view-toolbar-label">
        <input
          type="checkbox"
          checked={showNonCanvas}
          onChange={(e) => onShowNonCanvasChange(e.target.checked)}
        />
        Others
      </label>
    </div>
  )
}

export default ListViewToolbar
