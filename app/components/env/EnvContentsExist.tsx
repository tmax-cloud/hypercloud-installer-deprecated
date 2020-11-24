import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

import {
  Collapse,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  FormControl,
  TextField,
  Tooltip
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from './EnvContentsExist.css';
import * as env from '../../utils/common/env';
import MasterImage from '../../../resources/assets/ic_crown.svg.svg';
import Node, { ROLE } from '../../utils/class/Node';
import routes from '../../utils/constants/routes.json';

// interface Data {
//   calories: number;
//   carbs: number;
//   fat: number;
//   name: string;
//   protein: number;
// }

interface Data {
  name: string;
  // nodeCnt: number;
  updatedTime: string;
  productList: Array<string>;
  nodeList: Node[];
}

// function createData(
//   name: string,
//   calories: number,
//   fat: number,
//   carbs: number,
//   protein: number,
// ): Data {
//   return { name, calories, fat, carbs, protein };
// }

// const rows = [
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Donut', 452, 25.0, 51, 4.9),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
//   createData('Honeycomb', 408, 3.2, 87, 6.5),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Jelly Bean', 375, 0.0, 94, 0.0),
//   createData('KitKat', 518, 26.0, 65, 7.0),
//   createData('Lollipop', 392, 0.2, 98, 0.0),
//   createData('Marshmallow', 318, 0, 81, 2.0),
//   createData('Nougat', 360, 19.0, 9, 37.0),
//   createData('Oreo', 437, 18.0, 63, 4.0),
// ];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', numeric: false, disablePadding: true, label: '이름' },
  { id: 'nodeCnt', numeric: true, disablePadding: false, label: '노드 수' },
  {
    id: 'installedCnt',
    numeric: true,
    disablePadding: false,
    label: '설치 제품 수'
  },
  {
    id: 'updatedTime',
    numeric: false,
    disablePadding: false,
    label: '업데이트 시간'
  },
  {
    id: 'edit',
    numeric: false,
    disablePadding: false,
    label: '수정'
  }
  // { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' },
];

const useStyles = makeStyles(() =>
  createStyles({
    // root: {
    //   width: '100%'
    // },
    // head: {
    //   backgroundColor: '#000',
    //   color: '#fff'
    // },
    // paper: {
    //   width: '100%',
    //   marginBottom: theme.spacing(2)
    // },
    // table: {
    //   minWidth: 750
    // },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1
    }
  })
);

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort
  } = props;
  const createSortHandler = (property: keyof Data) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead className={['primary'].join(' ')}>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        <TableCell />
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            // align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// const useToolbarStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       paddingLeft: theme.spacing(2),
//       paddingRight: theme.spacing(1)
//     },
//     highlight:
//       theme.palette.type === 'light'
//         ? {
//             color: theme.palette.secondary.main,
//             backgroundColor: lighten(theme.palette.secondary.light, 0.85)
//           }
//         : {
//             color: theme.palette.text.primary,
//             backgroundColor: theme.palette.secondary.dark
//           },
//     title: {
//       flex: '1 1 100%'
//     }
//   })
// );

// interface EnhancedTableToolbarProps {
//   numSelected: number;
// }

// const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
//   const classes = useToolbarStyles();
//   const { numSelected } = props;

//   return (
//     <Toolbar
//       className={clsx(classes.root, {
//         [classes.highlight]: numSelected > 0
//       })}
//     >
//       {numSelected > 0 ? (
//         <Typography
//           className={classes.title}
//           color="inherit"
//           variant="subtitle1"
//           component="div"
//         >
//           {numSelected}
//           selected
//         </Typography>
//       ) : (
//         <Typography
//           className={classes.title}
//           variant="h6"
//           id="tableTitle"
//           component="div"
//         >
//           Nutrition
//         </Typography>
//       )}
//       {numSelected > 0 ? (
//         <Tooltip title="Delete">
//           <IconButton aria-label="delete">
//             <DeleteIcon />
//           </IconButton>
//         </Tooltip>
//       ) : (
//         <Tooltip title="Filter list">
//           <IconButton aria-label="filter list">
//             <FilterListIcon />
//           </IconButton>
//         </Tooltip>
//       )}
//     </Toolbar>
//   );
// };

export default function EnvContentsExist(props: any) {
  console.debug(EnvContentsExist.name, props);
  const { history } = props;

  const [rows, setRows] = useState(env.loadEnvList());

  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('updatedTime');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // search
  const [age, setAge] = React.useState('');
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAge(event.target.value as string);
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n: any) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setDense(event.target.checked);
  // };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  // delete dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };
  const getDeleteDialogContents = () => {
    if (selected.length > 1) {
      return (
        <div
          style={{ marginBottom: '20px' }}
          className={['dark', 'medium'].join(' ')}
        >
          선택한&nbsp;
          {selected.length}
          개의 환경을 삭제하시겠습니까?
        </div>
      );
    }
    return (
      <div style={{ marginBottom: '20px' }}>
        <div className={['dark', 'medium'].join(' ')}>
          선택한 환경을 삭제하시겠습니까?
        </div>
        <div className={['indicator', 'medium', 'thick'].join(' ')}>
          <span>{selected[0]}</span>
        </div>
      </div>
    );
  };

  // table row
  function Row({ row, index }) {
    console.debug(row.nodeList);
    const isItemSelected = isSelected(row.name);
    const labelId = `enhanced-table-checkbox-${index}`;
    const [open, setOpen] = React.useState(false);

    const getMasterWorkerImage = role => {
      let component = null;
      if (role === ROLE.MASTER || role === ROLE.MAIN_MASTER) {
        component = (
          <Tooltip title="Master" placement="top" arrow>
            <div className={['left'].join(' ')}>
              <img
                style={{ margin: '3px 5px 0 0' }}
                src={MasterImage}
                alt="Logo"
              />
            </div>
          </Tooltip>
        );
      } else if (role === ROLE.WORKER) {
        component = <span style={{ margin: '0 17px 0 0' }} />;
      }
      return component;
    };

    const getProductJsx = products => {
      let component = null;
      if (products.length === 0) {
        component = (
          <span className={['small'].join(' ')}>설치된 제품이 없습니다.</span>
        );
      } else {
        component = (
          <div className={['small'].join(' ')}>
            {products.map((p, index) => {
              if (index === products.length - 1) {
                return <span key={p.name}>{p.name}</span>;
              }
              return <span key={p.name}>{p.name}, </span>;
            })}
          </div>
        );
      }
      // console.debug(component);
      return component;
    };

    return (
      <>
        <TableRow
          hover
          onClick={event => handleClick(event, row.name)}
          role="checkbox"
          aria-checked={isItemSelected}
          tabIndex={-1}
          key={row.name}
          selected={isItemSelected}
        >
          <TableCell padding="checkbox">
            <Checkbox
              checked={isItemSelected}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </TableCell>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={e => {
                setOpen(!open);
                e.stopPropagation();
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" id={labelId} scope="row" padding="none">
            <a
              className={['indicator'].join(' ')}
              onClick={() => {
                history.push(`${routes.INSTALL.HOME}/${row.name}`);
              }}
            >
              {row.name}
            </a>
          </TableCell>
          <TableCell>{row.nodeList.length}</TableCell>
          <TableCell>{row.productList.length}</TableCell>
          <TableCell>{new Date(row.updatedTime).toString()}</TableCell>
          <TableCell>
            <IconButton
              aria-label="delete"
              onClick={() => {
                history.push(`${routes.ENV.EDIT}/${row.name}`);
              }}
            >
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              backgroundColor: '#F9F8F8'
            }}
            colSpan={7}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={2}>
                <Typography variant="h6" gutterBottom component="div">
                  <span className={['small', 'thick'].join(' ')}>노드</span>
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>IP</TableCell>
                      <TableCell>Port</TableCell>
                      <TableCell>Host Name</TableCell>
                      <TableCell>User</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody
                    style={{
                      backgroundColor: '#F2F8FF'
                    }}
                  >
                    {row.nodeList.map((nodeRow: any) => (
                      <TableRow key={nodeRow.ip}>
                        <TableCell component="th" scope="row">
                          {getMasterWorkerImage(nodeRow.role)}
                          {nodeRow.ip}
                        </TableCell>
                        <TableCell>{nodeRow.port}</TableCell>
                        <TableCell>{nodeRow.hostName}</TableCell>
                        <TableCell>{nodeRow.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Box margin={2}>
                <Typography variant="h6" gutterBottom component="div">
                  <span className={['small', 'thick'].join(' ')}>
                    설치 제품
                  </span>
                </Typography>
                {getProductJsx(row.productList)}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }
  return (
    <div className={styles.wrap}>
      <div className={[styles.tableToolBar, 'childUpDownDown'].join(' ')}>
        <span className={['left'].join(' ')}>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            size="small"
            className={['secondary'].join(' ')}
            onClick={() => {
              handleClickOpen();
            }}
            disabled={!selected.length}
          >
            삭제
          </Button>
          <Dialog
            open={dialogOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              환경 삭제
              <IconButton
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '5px'
                }}
                aria-label="close"
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {getDeleteDialogContents()}
              <div>
                <span className={['lightDark', 'small'].join(' ')}>
                  해당 환경에 설치된 제품 기능도 모두 삭제 됩니다.
                </span>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                className={['primary'].join(' ')}
                onClick={() => {
                  // dialog 닫기
                  handleClose();

                  // 선택된 환경 삭제
                  selected.map(name => {
                    env.deleteEnvByName(name);
                  });

                  // 모두 지워졌으면 not exist 화면으로
                  const envList = env.loadEnvList();
                  if (envList.length > 0) {
                    setRows(envList);
                  } else {
                    // dispatchEnvPage(CONST.ENV.MANAGE);
                    history.push(routes.ENV.NOT_EXIST);
                  }
                }}
                size="small"
              >
                삭제
              </Button>
              <Button
                className={['secondary'].join(' ')}
                onClick={handleClose}
                color="primary"
                size="small"
                autoFocus
              >
                취소
              </Button>
            </DialogActions>
          </Dialog>
        </span>
        <span className={['right'].join(' ')}>
          <div className={['childLeftRightRight', 'childUpDownDown'].join(' ')}>
            {/* <select name="searchCategory">
              <option value="envName">환경이름</option>
            </select>
            <input
              type="text"
              onChange={e => {
                const searchResultEnv = [];
                env.map(environment => {
                  if (environment.name.indexOf(e.target.value) !== -1) {
                    searchResultEnv.push(environment);
                  }
                });
                setRows(searchResultEnv);
              }}
            /> */}
            <span className={['indicator', 'verySmall'].join(' ')}>
              {rows.length}
            </span>
            <span
              style={{ marginRight: '10px' }}
              className={['', 'verySmall'].join(' ')}
            >
              개
            </span>
            <FormControl variant="outlined" className={styles.select}>
              {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
              <Select
                native
                value={age}
                onChange={handleChange}
                inputProps={{
                  name: 'age',
                  id: 'age-native-simple'
                }}
              >
                {/* <option aria-label="None" value="" /> */}
                <option value={10}>환경 이름</option>
              </Select>
            </FormControl>
            <TextField
              id="input-with-icon-textfield"
              className={[styles.search].join(' ')}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
              onChange={e => {
                console.debug(rows);
                const searchResultEnv = [];
                env.loadEnvList().map(environment => {
                  if (environment.name.indexOf(e.target.value) !== -1) {
                    searchResultEnv.push(environment);
                  }
                });
                setRows(searchResultEnv);
              }}
            />
          </div>
        </span>
      </div>
      <Paper className={classes.paper} variant="outlined">
        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return <Row key={row.name} row={row} index={index} />;
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      {/* <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      /> */}
    </div>
  );
}
