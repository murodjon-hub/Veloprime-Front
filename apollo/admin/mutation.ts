import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProductByAdmin($input: UpdateProductInput!) {
		updateProductByAdmin(input: $input) {
			_id
			productType
			productStatus
			productAgeCategory
			productColor
			productSize
			productName
			productPrice
			productViews
			productLikes
			productImages
			productDesc
			memberId
			soldAt
			deletedAt
			updatedAt
		}
	}
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
	mutation RemoveProductByAdmin($input: String!) {
		removeProductByAdmin(productId: $input) {
			_id
			productType
			productStatus
			productName
			productPrice
			memberId
			deletedAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
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

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
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
 *          EVENT         *
 *************************/

export const UPDATE_EVENT_BY_ADMIN = gql`
	mutation UpdateEventByAdmin($input: EventUpdate!) {
		updateEventByAdmin(input: $input) {
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
			updatedAt
		}
	}
`;

export const REMOVE_EVENT_BY_ADMIN = gql`
	mutation RemoveEventByAdmin($input: String!) {
		removeEventByAdmin(eventId: $input) {
			_id
			eventTitle
			eventStatus
			memberId
			createdAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
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
