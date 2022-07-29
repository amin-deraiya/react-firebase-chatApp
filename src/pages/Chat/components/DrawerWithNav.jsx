import * as React from 'react';
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
import { Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { Drawer, DrawerHeader, StyledBadge, AppBar } from '../Chat';
import { useUserAuth } from '../../../context/userAuthContext';

export function DrawerWithNav(props) {
  const [open, setOpen] = React.useState(true);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const { user, logOut } = useUserAuth();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

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

  return (
    <Box
      className='wrapper'
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          position: 'absolute',
        },
      })}
    >
      <Drawer variant='permanent' open={open}>
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
        <List>
          {props.allUsers?.map((item, index) => (
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
                    overlap='circular'
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }} // variant='dot'
                  >
                    <Avatar alt='Remy Sharp' src={item?.data?.profile_pictures} />
                  </StyledBadge>
                </ListItemIcon>
                <ListItemText
                  primary={item?.data?.displayName?.split(' ')[0]}
                  sx={{
                    opacity: open ? 1 : 0,
                  }}
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
              ...(open && {
                display: 'none',
              }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box display='flex' justifyContent='space-between' width='100%'>
            <Typography variant='h6' noWrap component='div'>
              Penguins Chat
            </Typography>
            <Box
              sx={{
                flexGrow: 0,
              }}
            >
              <Tooltip title='Open settings'>
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
  );
}
