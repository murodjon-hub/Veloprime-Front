import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages } from '../config';
import { getImageUrl } from '../utils';
import { sweetErrorAlert } from '../sweetAlert';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user   = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!socket) return;

		socket.onmessage = (msg) => {
			const data = JSON.parse(msg.data as string);

			switch (data.event) {
				case 'info': {
					const info = data as InfoPayload;
					setOnlineUsers(info.totalClients);
					break;
				}
				case 'getMessages': {
					const list: MessagePayload[] = data.list ?? [];
					setMessagesList(list);
					break;
				}
				case 'message': {
					const newMsg = data as MessagePayload;
					setMessagesList((prev) => [...prev, newMsg]);
					break;
				}
			}
		};
	}, [socket]);

	useEffect(() => {
		const id = setTimeout(() => setOpenButton(true), 100);
		return () => clearTimeout(id);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => setOpen((prev) => !prev);

	const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageInput(e.target.value);
	}, []);

	const onClickHandler = () => {
		if (!messageInput) {
			sweetErrorAlert(Messages.error4);
			return;
		}
		if (!socket) return;
		socket.send(JSON.stringify({ event: 'message', data: messageInput }));
		setMessageInput('');
	};

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') onClickHandler();
	};

	return (
		<Stack className="chatting">
			{openButton && (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			)}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box component="div" className={'chat-top'}>
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
				</Box>
				<Box component="div" className={'chat-content'} id="chat-content" ref={chatContentRef}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>
							{messagesList.map((ele, idx) => {
								const { text, memberData } = ele;
								const memberImage = getImageUrl(memberData?.memberImage, '/img/profile/defaultUser.svg');

								return memberData?._id === user?._id ? (
									<Box
										key={idx}
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-right'}>{text}</div>
									</Box>
								) : (
									<Box key={idx} flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar alt={memberData?.memberNick ?? 'user'} src={memberImage} />
										<div className={'msg-left'}>{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box component="div" className={'chat-bott'}>
					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
