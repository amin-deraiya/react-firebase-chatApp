import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Badge, CardHeader, Chip, Fab, TextField, Typography } from '@mui/material';
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
import { DrawerWithNav } from './components/DrawerWithNav';
import moment from 'moment';
import './chat.css';

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

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export const AppBar = styled(MuiAppBar, {
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

export const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
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
  })
);

export const StyledBadge = styled(Badge)(({ theme }) => ({
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
  const [allUsers, setAllUsers] = React.useState([]);
  const [roomId, setRoomId] = React.useState('');
  const [selectedPerson, setSelectedPerson] = React.useState([]);
  const [messages, setMessages] = React.useState([]);

  const [message, setMessage] = React.useState('');
  const { user } = useUserAuth();

  const scrollToBottom = () => {
    var objDiv = document.getElementById('boxData');
    if (objDiv) {
      objDiv.scrollTop = objDiv?.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    let roomid = [user.uid, person.data.uid].sort();
    roomid = roomid[0] + roomid[1];
    setSelectedPerson(person);
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
    const msg = message.trim();
    if (msg) {
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
    } else {
      setMessage('');
    }
  };


  return (
    <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
      <CssBaseline />
      <DrawerWithNav allUsers={allUsers} handlePersonChat={handlePersonChat} />
      <Box
        component='main'
        sx={(theme) => ({
          flexGrow: 1,
          [theme.breakpoints.down('sm')]: {
            marginLeft: '65px',
          },
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '1024px',
          mx: 'auto',
        })}
      >
        <DrawerHeader />
        {selectedPerson?.data ? (
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
        ) : null}
        {selectedPerson?.data ? (
          <Box
            sx={{
              height: 'calc(100vh - 197px)',
              pt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
            id='boxData'
          >
            <Box
              sx={{
                flex: 1,
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                mb: 2,
              }}
              className='msgWrapper'
            >
              {messages?.map((msg, i) => {
                return (
                  <Box
                    key={i}
                    className={msg.sender === user.uid ? 'myMessage' : 'notMyMessage'}
                    sx={{
                      alignSelf: msg.sender === user.uid ? 'end' : 'flex-start',
                      my: 0.3,
                      maxWidth: '80%',
                    }}
                  >
                    <Chip
                      color={msg.sender === user.uid ? 'primary' : 'secondary'}
                      label={
                        <Box display='flex' flexDirection='column'>
                          <span style={{ fontWeight: '500' }}>{msg.message}</span>
                          <Typography variant='body2' color='burlywood' fontWeight={'bold'}>
                            {moment(msg.time.toDate().toString()).format('D-MMM-YY, h:mm a')}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        fontSize: 'large',
                        height: 'auto',
                        p: 1,
                        borderTopRightRadius: msg.sender === user.uid ? '0px' : '16px',
                        borderTopLeftRadius: msg.sender !== user.uid ? '0px' : '16px',
                        '& span': {
                          whiteSpace: 'normal',
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}
        {selectedPerson?.data ? (
          <form
            onSubmit={sendMsg}
            style={{
              position: 'fixed',
              bottom: 0,
              width: '100%',
              maxWidth: '1024px',
              // backgroundColor: 'white',
              paddingTop: '10px',
              paddingBottom: '10px',
            }}
          >
            <Box display='flex' sx={{ px: 1, alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ mr: 1, flex: 1 }}>
                <TextField
                  variant='outlined'
                  value={message}
                  label='Type message'
                  sx={{ width: '100%' }}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Box>
              <Box sx={{ mr: 1, height: '100%' }}>
                <Fab color='primary' aria-label='send' type='submit'>
                  <SendIcon />
                </Fab>
              </Box>
            </Box>
          </form>
        ) : null}
      </Box>
    </Box>
  );
}
