import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Badge, Button, CardHeader, Chip, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import { useUserAuth } from '../../context/userAuthContext';
import {
  collection,
  query,
  onSnapshot,
  where,
  documentId,
  Timestamp,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../firebase';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export default function Chat() {
  const [open, setOpen] = React.useState(true);
  const [allUsers, setAllUsers] = React.useState([]);
  const [roomId, setRoomId] = React.useState('');
  const [selectedPerson, setSelectedPerson] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const { logOut, user } = useUserAuth();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  React.useEffect(() => {
    if (user.uid) {
      const q = query(collection(db, 'users'), where(documentId(), '!=', user?.uid));
      onSnapshot(q, (querySnapshot) => {
        setAllUsers(
          querySnapshot.docs.map((document) => {
            return {
              data: document.data(),
            };
          })
        );
      });
    }
  }, [user]);

  const handleLogout = () => {
    logOut();
  };

  function getMessages(roomId) {
    return onSnapshot(
      query(collection(db, 'chats', roomId, 'messages'), orderBy('time', 'asc'), limit(30)),
      (querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setMessages(messages);
      }
    );
  }

  const handlePersonChat = async (person) => {
    setOpen(false);
    let roomid = [user.uid, person.data.uid].sort();
    roomid = roomid[0] + roomid[1];
    setSelectedPerson(person);
    console.log({ roomid });
    setRoomId(roomid);
    getMessages(roomid);

    // try {
    //   // setDoc(doc(db, 'users', user.uid), {

    //   await setDoc(doc(db, 'chats', roomId), {
    //     roomDetail: [
    //       {
    //         name: user.displayName,
    //         uid: user.uid,
    //         unreadCound: 0,
    //       },
    //       {
    //         name: person.data.displayName,
    //         uid: person.data.uid,
    //         unreadCound: 0,
    //       },
    //     ],
    //   });
    // } catch (error) {
    //   console.error(error);
    // }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    const msg = message;
    const msgObj = {
      time: Timestamp.now(),
      message: msg,
      sender: user.uid,
      receiver: selectedPerson.data.uid,
    };
    console.log({ msgObj });
    setMessages((oldArray) => [...oldArray, msgObj]);
    try {
      await addDoc(collection(db, 'chats', roomId, 'messages'), msgObj);
    } catch (error) {
      console.error(error);
    }
    setMessage('');
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
      <CssBaseline />
      <Box
        className='wrapper'
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            position: 'absolute',
          },
        })}
      >
        <Drawer variant='permanent' open={open}>
          <DrawerHeader sx={{ justifyContent: 'flex-start', background: '#1976d2' }}>
            <IconButton onClick={handleDrawerClose}>
              {/* {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />} */}
              <MenuIcon sx={{ color: 'white' }} />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {allUsers?.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  onClick={() => handlePersonChat(item)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <StyledBadge
                      overlap='circular'
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      // variant='dot'
                    >
                      <Avatar alt='Remy Sharp' src={item?.data?.profile_pictures} />
                    </StyledBadge>
                  </ListItemIcon>
                  <ListItemText
                    primary={item?.data?.displayName?.split(' ')[0]}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {/* <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
        </Drawer>
        <AppBar
          position='fixed'
          open={open}
          sx={(theme) => ({
            boxShadow: 'none',
            [theme.breakpoints.down('sm')]: {
              width: open ? 'calc(100% - 48px)' : '100%',
            },
          })}
        >
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              onClick={handleDrawerOpen}
              edge='start'
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box display='flex' justifyContent='space-between' width='100%'>
              <Typography variant='h6' noWrap component='div'>
                Penguins Chat
              </Typography>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title='Open settings'>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.displayName} src={user.photoURL} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id='menu-appbar'
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
                    <Typography textAlign='center'>{user.displayName}</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      handleLogout();
                    }}
                  >
                    <Typography textAlign='center'>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      <Box
        component='main'
        sx={(theme) => ({
          flexGrow: 1,
          [theme.breakpoints.down('sm')]: {
            marginLeft: '65px',
          },
        })}
      >
        <DrawerHeader />
        {selectedPerson?.data ? (
          <Box
            sx={{
              height: 'calc(100% - 64px)',
              pt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '1024px',
              mx: 'auto',
            }}
          >
            <Box
              sx={(theme) => ({
                [theme.breakpoints.down('lg')]: {
                  px: 2,
                },
              })}
            >
              <CardHeader
                avatar={<Avatar src={selectedPerson?.data?.profile_pictures} aria-label='recipe' />}
                sx={{ p: 0, mb: 1.5 }}
                title={selectedPerson?.data?.displayName}
              />
              <Divider />
            </Box>
            <Box
              sx={{
                flex: 1,
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                mb: 2,
              }}
            >
              {messages?.map((msg, i) => {
                return (
                  <Box key={i} sx={{ alignSelf: msg.sender === user.uid ? 'end' : 'flex-start', my: 0.5 }}>
                    <Chip
                      color={msg.sender === user.uid ? 'primary' : 'secondary'}
                      label={msg.message}
                      sx={{ fontSize: 'large' }}
                    />
                  </Box>
                );
              })}
            </Box>
            <form onSubmit={sendMsg}>
              <Box display='flex' sx={{ px: 1, alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 1, flex: 1 }}>
                  <TextField
                    variant='filled'
                    value={message}
                    label='Type message'
                    sx={{ width: '100%' }}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Box>
                <Box sx={{ mr: 1, height: '100%' }}>
                  <Button variant='contained' endIcon={<SendIcon />} sx={{ height: '100%' }} type='submit'>
                    Send
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
