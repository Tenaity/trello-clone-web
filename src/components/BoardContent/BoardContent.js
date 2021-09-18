import Column from 'components/Column/Column'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { initialData } from 'actions/initialData'
import { isEmpty } from 'lodash'
import './BoardContent.scss'
import { mapOrder } from 'utilities/sorts'
import { Container, Draggable } from 'react-smooth-dnd'
import { applyDrag } from 'utilities/dragDrop'
import {
  Container as ContainerBtn,
  Row,
  Col,
  Form,
  Button
} from 'react-bootstrap'
export default function BoardContent() {
  const [board, setBoard] = useState({})
  const [columns, setColumns] = useState([])
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)

  const newColumnInputRef = useRef(null)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const onNewColumnTitleChange = useCallback((e) => {
    setNewColumnTitle(e.target.value), []
  })

  useEffect(() => {
    const boardFromDB = initialData.boards.find(
      (board) => board.id === 'board-1'
    )
    if (boardFromDB) {
      setBoard(boardFromDB)
      //sort column

      setColumns(mapOrder(boardFromDB.columns, boardFromDB.columnOrder, 'id'))
    }
  }, [])

  useEffect(() => {
    if (newColumnInputRef && newColumnInputRef.current)
      newColumnInputRef.current.focus()
  }, [openNewColumnForm])

  if (isEmpty(board)) {
    return (
      <div className="not-found" style={{ padding: '10px', color: 'white' }}>
        Board not found
      </div>
    )
  }

  const onColumnDrop = (dropResult) => {
    let newColumns = [...columns]
    newColumns = applyDrag(newColumns, dropResult)
    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map((c) => c.id)
    newBoard.columns = newColumns
    setColumns(newColumns)
    setBoard(newBoard)
  }

  const onCardDrop = (columnId, dropResult) => {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      let newColumns = [...columns]
      let currentColumn = newColumns.find((column) => column.id === columnId)
      currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
      currentColumn.cardOrder = currentColumn.cards.map((i) => i.id)
      setColumns(newColumns)
    }
  }

  const toggleOpenNewColumnForm = () =>
    setOpenNewColumnForm(!openNewColumnForm)

  const deleteTitle = () => {
    setNewColumnTitle('')
    toggleOpenNewColumnForm()

  }
  const addNewColumn = () => {
    if (!newColumnTitle) {
      newColumnInputRef.current.focus()
    }
    const newColumnToAdd = {
      id: Math.random().toString(36).substr(2, 5), // 5 random charaters, will remove when we implement code api
      title: newColumnTitle,
      boardId: board.id,
      cardOrder: [],
      cards: []
    }
    let newColumns = [...columns]
    newColumns.push(newColumnToAdd)

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map((c) => c.id)
    newBoard.columns = newColumns
    setColumns(newColumns)
    setBoard(newBoard)
    setNewColumnTitle('')
    setOpenNewColumnForm(!openNewColumnForm)
  }
  return (
    <div className="board-content">
      <Container
        orientation="horizontal"
        onDrop={onColumnDrop}
        dragHandleSelector=".column-drag-handle"
        getChildPayload={(index) => columns[index]}
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'column-drop-preview'
        }}
      >
        {columns.map((column, index) => (
          <Draggable key={index}>
            <Column column={column} onCardDrop={onCardDrop} />
          </Draggable>
        ))}
      </Container>

      <ContainerBtn className="trello-container">
        {!openNewColumnForm && (
          <Row>
            <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
              <i className="fa fa-plus icon" />
              Add another card
            </Col>
          </Row>
        )}
        {openNewColumnForm && (
          <Row>
            <Col className="enter-new-column">
              <Form.Control
                className="input-enter-new-column"
                onChange={onNewColumnTitleChange}
                onKeyDown={(event) => event.key === 'Enter' && addNewColumn()}
                value={newColumnTitle}
                ref={newColumnInputRef}
                type="text"
                placeholder="Enter column title..."
              />
              <Button size="sm" variant="success" onClick={addNewColumn}>
                Add Column
              </Button>
              <span className="cancel-new-column" onClick={deleteTitle}>
                <i className="fa fa-trash icon"></i>
              </span>
            </Col>
          </Row>
        )}
      </ContainerBtn>
    </div>
  )
}
