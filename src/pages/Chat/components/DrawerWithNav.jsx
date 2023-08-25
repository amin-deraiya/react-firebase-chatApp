import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Avatar, Button, Chip, Menu, MenuItem, Tooltip } from '@mui/material';
import { Drawer, DrawerHeader, StyledBadge, AppBar } from '../Chat';
import { useUserAuth } from '../../../context/userAuthContext';
import {
  collection,
  documentId,
  getCountFromServer,
  limit,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { useDrawer } from '../../../context/drawerContext';

export function DrawerWithNav(props) {
  /**
   * @states
   */
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [myObject, setMyObject] = useState([]);
  const [allRoomIds, setAllRoomIds] = useState([]);
  const [userLimit, setUserLimit] = useState(15);
  const [totalUsers, setTotalUsers] = useState(0);

  /**
   * @variables
   */
  const { open, setOpen } = useDrawer();
  const { user, logOut } = useUserAuth();

  /**
   * @functions
   */
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  useEffect(() => {
    (async () => {
      const coll = collection(db, 'users');
      const snapshot = await getCountFromServer(coll);
      const count = snapshot.data().count;
      setTotalUsers(count);
    })();
  }, []);

  React.useEffect(() => {
    if (user?.uid) {
      const q = query(collection(db, 'users'), where(documentId(), '==', user.uid));
      onSnapshot(q, (qSnapshot) => {
        setMyObject(
          qSnapshot.docs.map((doc) => {
            return doc.data();
          })[0]
        );
      });
    }
  }, [user]);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logOut();
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    setUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLimit]);

  React.useEffect(() => {
    if (allRoomIds?.length > 0) {
      allRoomIds.forEach((roomid) => {
        const q = query(collection(db, 'chats'), where(documentId(), '==', roomid));
        onSnapshot(q, (qSnapshot) => {
          qSnapshot.docs.forEach((doc) => {
            let roomDetail = doc.data();
            let finalData = allUsers.map((item) => {
              if (item.data.roomIdWithMe === roomid) {
                item.data.roomDetail = roomDetail;
                return item;
              } else {
                return item;
              }
            });
            const arrUniq = [...new Map(finalData.map((v) => [v.data.uid, v])).values()];
            setAllUsers(arrUniq);
          });
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRoomIds]);

  const setUsers = async () => {
    if (user.uid) {
      const q = query(collection(db, 'users'), where(documentId(), '!=', user?.uid), limit(userLimit));
      onSnapshot(q, (querySnapshot) => {
        setAllUsers(
          querySnapshot.docs.map((document) => {
            let roomid = [user.uid, document.data().uid].sort();
            roomid = roomid[0] + roomid[1];
            setAllRoomIds((oldArray) => [...oldArray, roomid]);
            const data = document.data();
            data.roomIdWithMe = roomid;
            return { data };
          })
        );
      });
    }
  };

  return (
    <Box
      className="wrapper"
      sx={(theme) => ({
        boxShadow: 'rgb(0 0 0 / 15%) 2.95px 1.95px 8.6px',
        [theme.breakpoints.down('sm')]: {
          position: 'absolute',
        },
      })}
    >
      <Drawer
        variant="permanent"
        open={open}
        sx={(theme) => ({
          '.MuiDrawer-paper': {
            backgroundColor: 'transparent',
          },
          [theme.breakpoints.down('sm')]: {
            '.MuiDrawer-paper': {
              boxShadow: 'rgb(0 0 0 / 15%) 2.95px 1.95px 8.6px',
            },
          },
        })}
      >
        <DrawerHeader
          sx={{
            justifyContent: 'flex-start',
            background: '#1976d2',
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            {/* {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />} */}
            <MenuIcon sx={{ color: 'white' }} />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{overflowY: 'auto', overflowX: 'hidden'}}>
          <>
          {allUsers?.map((item, index) => {
            const unreadCount = item?.data?.roomDetail
              ? typeof item?.data?.roomDetail[user?.uid]?.unread_count === 'number'
              ? item?.data?.roomDetail[user?.uid]?.unread_count
              : 0
              : 0;
              return (
              <ListItem
              key={index}
                disablePadding
                sx={{
                  display: 'block',
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  onClick={() => {
                    props.handlePersonChat(item);
                    setOpen(false);
                  }}
                  >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                    >
                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }} // variant='dot'
                      >
                      <Avatar alt="" src={item?.data?.profile_pictures} />
                    </StyledBadge>
                  </ListItemIcon>
                  <ListItemText
                    primary={item?.data?.displayName?.split(' ')[0]}
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                    />
                  <Chip
                    label={unreadCount}
                    color={unreadCount > 0 ? 'primary' : 'secondary'}
                    sx={{ display: open && unreadCount > 0 ? 'flex' : 'none' }}
                    // variant='outlined'
                    />
                </ListItemButton>
              </ListItem>
            );
          })}
          <ListItem disablePadding>{totalUsers >= userLimit && open && (
          <Box mb={2} mt={0.5} width={'100%'}>
            <Button sx={{ width: '100%' }} onClick={() => setUserLimit((userLimit) => userLimit + 5)}>
              Load more
            </Button>
          </Box>
        )}</ListItem>
          </>
        </List>
      </Drawer>
      <AppBar
        position="fixed"
        open={open}
        sx={(theme) => ({
          boxShadow: 'none',
          mr: '1px',
          [theme.breakpoints.down('sm')]: {
            width: open ? 'calc(100% - 48px)' : '100%',
          },
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && {
                display: 'none',
              }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box display="flex" justifyContent="space-between" width="100%" alignItems={'center'}>
            <Typography variant="h6" noWrap component="div">
              Penguins Chat
            </Typography>
            <Box
              sx={{
                flexGrow: 0,
              }}
            >
              <Tooltip title="Open settings">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: 0,
                  }}
                >
                  <Avatar alt={user.displayName} src={user.photoURL} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{
                  mt: '45px',
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{myObject.displayName}</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    handleLogout();
                  }}
                >
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
