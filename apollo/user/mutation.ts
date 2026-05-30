import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productType
			productStatus
			productCondition
			productAgeCategory
			productColor
			productSize
			productName
			productBrand
			productPrice
			productImages
			productDesc
			productBrakeType
			productSuspension
			productGearCount
			productWheelSize
			productFrameSize
			productWeight
			productMileage
			productYear
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: UpdateProductInput!) {
		updateProduct(input: $input) {
			_id
			productType
			productStatus
			productAgeCategory
			productColor
			productSize
			productName
			productPrice
			productImages
			productDesc
			memberId
			updatedAt
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(productId: $input) {
			_id
			productLikes
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *         EVENT          *
 *************************/

export const CREATE_EVENT = gql`
	mutation CreateEvent($input: EventInput!) {
		createEvent(input: $input) {
			_id
			eventTitle
			eventDesc
			eventStatus
			eventImage
			fromLocation
			toLocation
			distance
			eventDate
			maxParticipants
			currentParticipants
			memberId
			createdAt
		}
	}
`;

export const UPDATE_EVENT = gql`
	mutation UpdateEvent($input: EventUpdate!) {
		updateEvent(input: $input) {
			_id
			eventTitle
			eventDesc
			eventStatus
			eventImage
			fromLocation
			toLocation
			distance
			eventDate
			maxParticipants
			updatedAt
		}
	}
`;

export const DELETE_EVENT = gql`
	mutation RemoveEvent($input: String!) {
		removeEvent(eventId: $input) {
			_id
			eventTitle
		}
	}
`;

export const JOIN_EVENT = gql`
	mutation JoinEvent($input: String!) {
		joinEvent(eventId: $input) {
			_id
			currentParticipants
			eventParticipants
		}
	}
`;

export const LEAVE_EVENT = gql`
	mutation LeaveEvent($input: String!) {
		leaveEvent(eventId: $input) {
			_id
			currentParticipants
			eventParticipants
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         REVIEW        *
 *************************/

export const CREATE_REVIEW = gql`
	mutation CreateReview($input: ReviewInput!) {
		createReview(input: $input) {
			_id
			reviewStatus
			reviewGroup
			reviewContent
			reviewRating
			reviewRefId
			memberId
			createdAt
		}
	}
`;

export const DELETE_REVIEW = gql`
	mutation DeleteReview($reviewId: String!) {
		deleteReview(reviewId: $reviewId) {
			_id
			reviewStatus
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const MARK_NOTIFICATION_READ = gql`
	mutation MarkNotificationRead($input: String!) {
		markNotificationRead(input: $input) {
			_id
			notificationStatus
		}
	}
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
	mutation MarkAllNotificationsRead {
		markAllNotificationsRead
	}
`;

export const REMOVE_NOTIFICATION = gql`
	mutation RemoveNotification($input: String!) {
		removeNotification(input: $input) {
			_id
		}
	}
`;

