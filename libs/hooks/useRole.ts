import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { MemberType } from '../enums/member.enum';

export const useRole = () => {
	const user = useReactiveVar(userVar);
	const role = user.memberType as MemberType | '';

	const isSeller = role === MemberType.MEMBER;

	return {
		role,
		isUser:          role === MemberType.USER,
		isSeller,
		isAdmin:         role === MemberType.ADMIN,
		isSellerOrAdmin: isSeller || role === MemberType.ADMIN,
		isLoggedIn:      Boolean(user._id),
	};
};
