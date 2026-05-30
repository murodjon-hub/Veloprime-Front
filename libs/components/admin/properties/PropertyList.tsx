import React, { useState } from 'react';
import Link from 'next/link';
import {
	Avatar, Box, Fade, IconButton, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Product } from '../../product/ProductCard';
import { getImageUrl } from '../../../utils';
import { ProductStatus } from '../../../enums/product/product';
import { StatusBadge } from '../shared/StatusBadge';

const COLS = ['PRODUCT', 'PRICE', 'TYPE / SIZE', 'MEMBER', 'STATUS', ''];

const ALL_STATUSES = Object.values(ProductStatus);

interface Props {
	products: Product[];
	updateProductHandler: (data: { _id: string; productStatus: ProductStatus }) => void;
	removeProductHandler: (id: string) => void;
}

export function ProductPanelList({ products, updateProductHandler, removeProductHandler }: Props) {
	const [anchor, setAnchor] = useState<null | { el: HTMLElement; id: string; status: ProductStatus }>(null);

	const open = (e: React.MouseEvent<HTMLButtonElement>, id: string, status: ProductStatus) => {
		setAnchor({ el: e.currentTarget, id, status });
	};
	const close = () => setAnchor(null);

	return (
		<TableContainer>
			<Table size="medium" sx={{ minWidth: 700 }}>
				<TableHead>
					<TableRow sx={{ background: '#fafafa' }}>
						{COLS.map((col) => (
							<TableCell key={col} sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
								{col}
							</TableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{products.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} align="center" sx={{ py: 6, color: '#bbb', fontSize: 13 }}>
								No products found
							</TableCell>
						</TableRow>
					)}

					{products.map((p) => (
						<TableRow key={p._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1.2 } }}>

							{/* Product */}
							<TableCell>
								<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<Box
										component="img"
										src={getImageUrl(p.productImages?.[0], '/img/banner/header1.svg')}
										sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #f0f0f0', flexShrink: 0 }}
									/>
									<Box component="div">
										{p.productStatus === ProductStatus.ACTIVE ? (
											<Link href={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
												<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', '&:hover': { color: '#e92c28' } }}>
													{p.productName}
												</Typography>
											</Link>
										) : (
											<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#666' }}>{p.productName}</Typography>
										)}
										<Typography sx={{ fontSize: 11, color: '#aaa' }}>{p._id.slice(-8)}</Typography>
									</Box>
								</Box>
							</TableCell>

							{/* Price */}
							<TableCell>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: '#e92c28' }}>
									${p.productPrice?.toLocaleString()}
								</Typography>
							</TableCell>

							{/* Type / Size */}
							<TableCell>
								<Typography sx={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{p.productType}</Typography>
								<Typography sx={{ fontSize: 11, color: '#aaa' }}>{p.productSize ?? '—'}</Typography>
							</TableCell>

							{/* Member */}
							<TableCell>
								<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Avatar
										src={getImageUrl((p as any).memberData?.memberImage, '/img/profile/defaultUser.svg')}
										sx={{ width: 26, height: 26 }}
									/>
									<Typography sx={{ fontSize: 12, color: '#374151' }}>
										{(p as any).memberData?.memberNick ?? '—'}
									</Typography>
								</Box>
							</TableCell>

							{/* Status */}
							<TableCell><StatusBadge status={p.productStatus} /></TableCell>

							{/* Actions */}
							<TableCell align="right">
								{p.productStatus === ProductStatus.DELETED ? (
									<Tooltip title="Permanently remove">
										<IconButton
											size="small"
											onClick={() => removeProductHandler(p._id)}
											sx={{ color: '#dc2626' }}
										>
											<DeleteForeverIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								) : (
									<IconButton
										size="small"
										onClick={(e) => open(e, p._id, p.productStatus as ProductStatus)}
										sx={{ color: '#9ca3af' }}
									>
										<MoreVertIcon fontSize="small" />
									</IconButton>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Shared action menu */}
			<Menu
				anchorEl={anchor?.el}
				open={Boolean(anchor)}
				onClose={close}
				TransitionComponent={Fade}
				PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 160 } }}
			>
				{ALL_STATUSES.filter(s => s !== anchor?.status).map(status => (
					<MenuItem
						key={status}
						onClick={() => { updateProductHandler({ _id: anchor!.id, productStatus: status }); close(); }}
						sx={{ fontSize: 13, py: 1 }}
					>
						Set&nbsp;<StatusBadge status={status} />
					</MenuItem>
				))}
			</Menu>
		</TableContainer>
	);
}
