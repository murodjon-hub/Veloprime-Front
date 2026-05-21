import React, { useMemo, useRef, useState, useCallback } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Button, FormControl, MenuItem, Select, Stack, TextField, Typography, CircularProgress } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useMutation, useReactiveVar } from '@apollo/client';
import axios from 'axios';
import dynamic from 'next/dynamic';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { getJwtToken } from '../../../libs/auth';
import { userVar } from '../../../apollo/store';
import { BoardArticleCategory } from '../../../libs/enums/board-article.enum';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../../libs/config';
import { Message } from '../../../libs/enums/common.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import '@toast-ui/editor/dist/toastui-editor.css';

// Dynamically import the Editor component to prevent SSR issues
const Editor = dynamic(
  () => import('@toast-ui/react-editor').then((m) => m.Editor),
  { ssr: false },
);

interface ArticleFormState {
  articleTitle: string;
  articleContent: string;
  articleImage: string;
}

const WriteBlogPage: NextPage = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const token = getJwtToken();
  const user = useReactiveVar(userVar);
  const editorRef = useRef<any>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // State for form fields
  const [formState, setFormState] = useState<ArticleFormState>({
    articleTitle: '',
    articleContent: '',
    articleImage: '',
  });
  const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(
    BoardArticleCategory.FREE,
  );
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

  // Memoized form data for API submission
  const articleInput = useMemo(
    () => ({ ...formState, articleCategory }),
    [formState, articleCategory],
  );

  // Shared image upload utility
  const uploadImageToServer = useCallback(async (image: File): Promise<string | undefined> => {
    try {
      const formData = new FormData();
      formData.append(
        'operations',
        JSON.stringify({
          query: `mutation ImageUploader($file: Upload!, $target: String!) {
            imageUploader(file: $file, target: $target)
          }`,
          variables: { file: null, target: 'article' },
        }),
      );
      formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
      formData.append('0', image);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'apollo-require-preflight': true,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.data.imageUploader;
    } catch (err) {
      console.error('Error uploading image:', err);
      sweetErrorHandling(new Error('Failed to upload image. Please try again.')).then();
      return undefined;
    }
  }, [token]);

  // Cover image handlers
  const handleCoverChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);

    const uploadedImageUrl = await uploadImageToServer(file);
    if (uploadedImageUrl) {
      setFormState((prevState) => ({ ...prevState, articleImage: uploadedImageUrl }));
    }
    setCoverUploading(false);
  }, [uploadImageToServer]);

  const removeCover = useCallback(() => {
    setCoverPreview('');
    setFormState((prevState) => ({ ...prevState, articleImage: '' }));
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }, []);

  // Editor inline image hook
  const uploadEditorImage = useCallback(async (image: File, callback: (url: string) => void) => {
    const uploaded = await uploadImageToServer(image);
    if (uploaded) {
      callback(`${REACT_APP_API_URL}/${uploaded}`);
    }
    return false; // Prevent default behavior
  }, [uploadImageToServer]);

  // Field handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prevState) => ({ ...prevState, articleTitle: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e: any) => {
    setArticleCategory(e.target.value as BoardArticleCategory);
  }, []);

  const handleEditorChange = useCallback(() => {
    // Defensive check: ensure editorRef.current and getInstance exist
    if (editorRef.current && typeof editorRef.current.getInstance === 'function') {
      const editorInstance = editorRef.current.getInstance();
      if (editorInstance) {
        setFormState((prevState) => ({ ...prevState, articleContent: editorInstance.getHTML() }));
      }
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user?._id) {
      await router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      let articleContent = formState.articleContent;
      
      // Final check of editor content before submission
      if (editorRef.current && typeof editorRef.current.getInstance === 'function') {
        const editorInstance = editorRef.current.getInstance();
        if (editorInstance) {
          articleContent = editorInstance.getHTML();
        }
      }

      if (!formState.articleTitle.trim() || !articleContent.trim()) {
        throw new Error(Message.INSERT_ALL_INPUTS);
      }

      await createBoardArticle({
        variables: { 
          input: { 
            ...articleInput, 
            articleContent 
          } 
        },
      });

      await sweetTopSuccessAlert('Article published successfully!', 700);
      await router.push('/community');
    } catch (err: any) {
      console.error('Error submitting article:', err);
      sweetErrorHandling(err).then();
    } finally {
      setIsSubmitting(false);
    }
  }, [user, router, formState.articleTitle, formState.articleContent, articleInput, createBoardArticle]);

  if (device === 'mobile') {
    return <Stack>WRITE BLOG MOBILE</Stack>;
  }

  return (
    <Box id="write-blog-page">
      {/* Sticky nav bar */}
      <Box className="write-blog__banner">
        <Typography className="write-blog__banner-title">New Story</Typography>
        <Typography className="write-blog__banner-sub">
          Share your cycling story with the community
        </Typography>
      </Box>

      <Box className="write-blog__body">
        {/* Category */}
        <Box className="write-blog__meta">
          <Box className="write-blog__field">
            <Typography className="write-blog__label">Category</Typography>
            <FormControl>
              <Select
                value={articleCategory}
                onChange={handleCategoryChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Select article category' }}
              >
                {Object.values(BoardArticleCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Cover image */}
        <Box className="write-blog__cover">
          {coverPreview ? (
            <Box className="write-blog__cover-preview">
              <Box
                component="img"
                src={coverPreview}
                alt="Article cover image"
                className="write-blog__cover-img"
              />
              <Box className="write-blog__cover-overlay">
                <Button
                  className="write-blog__cover-change"
                  onClick={() => coverInputRef.current?.click()}
                  startIcon={<AddPhotoAlternateOutlinedIcon />}
                  disabled={coverUploading}
                >
                  {coverUploading ? <CircularProgress size={20} color="inherit" /> : 'Change cover'}
                </Button>
                <Button
                  className="write-blog__cover-remove"
                  onClick={removeCover}
                  startIcon={<CancelOutlinedIcon />}
                  disabled={coverUploading}
                >
                  Remove
                </Button>
              </Box>
              {coverUploading && (
                <Box className="write-blog__cover-uploading">Uploading...</Box>
              )}
            </Box>
          ) : (
            <Box
              className="write-blog__cover-empty"
              onClick={() => coverInputRef.current?.click()}
            >
              <AddPhotoAlternateOutlinedIcon className="write-blog__cover-icon" />
              <Typography className="write-blog__cover-hint">Add a cover image</Typography>
              <Typography className="write-blog__cover-hint-sub">
                Recommended size 1400 × 600 px
              </Typography>
            </Box>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleCoverChange}
            disabled={coverUploading}
          />
        </Box>

        {/* Title */}
        <TextField
          className="write-blog__title-input"
          onChange={handleTitleChange}
          placeholder="Title"
          multiline
          variant="outlined"
          fullWidth
          value={formState.articleTitle}
          disabled={isSubmitting}
        />

        <Box className="write-blog__divider" />

        {/* Editor */}
        <Box className="write-blog__editor">
          <Typography className="write-blog__label">Content</Typography>
          <Editor
            initialValue={formState.articleContent}
            placeholder="Tell your story..."
            previewStyle="vertical"
            height="520px"
            initialEditType="wysiwyg"
            toolbarItems={[
              ['heading', 'bold', 'italic', 'strike'],
              ['image', 'table', 'link'],
              ['ul', 'ol', 'task'],
              ['code', 'codeblock'],
            ]}
            ref={editorRef}
            onChange={handleEditorChange}
            hooks={{
              addImageBlobHook: uploadEditorImage,
            }}
            usageStatistics={false}
          />
        </Box>

        {/* Actions */}
        <Stack direction="row" className="write-blog__actions">
          <Button
            variant="outlined"
            className="write-blog__btn write-blog__btn--cancel"
            onClick={() => router.push('/community')}
            disabled={isSubmitting}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            className="write-blog__btn write-blog__btn--submit"
            onClick={handleSubmit}
            disabled={isSubmitting || coverUploading}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default withLayoutBasic(WriteBlogPage);

