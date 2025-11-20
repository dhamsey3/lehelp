import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { CaseCategory, CaseSubmission, CaseUrgency } from '../types/case.types';

const steps = ['Case Details', 'Location', 'Review & Submit'];

export const CaseSubmissionForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseType: '',
    urgency: 'medium',
    location: {
      country: '',
      city: '',
      region: '',
    },
    anonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const name = e.target.name as string;
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value as string,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const location = [
        formData.location.city,
        formData.location.region,
        formData.location.country,
      ]
        .filter(Boolean)
        .join(', ');

      const payload: CaseSubmission = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: (formData.caseType as CaseCategory) || 'other',
        urgency: (formData.urgency as CaseUrgency) || 'medium',
        location: location || undefined,
        anonymous: formData.anonymous,
      };

      const response = await apiService.cases.create(payload);

      setSuccess(true);

      // Redirect to case details after 2 seconds
      setTimeout(() => {
        navigate(`/cases/${response.data.data.case.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Case Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              helperText="Brief summary of your case (5-200 characters)"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Case Description"
              name="description"
              multiline
              rows={6}
              value={formData.description}
              onChange={handleChange}
              helperText="Provide detailed information about your case (minimum 20 characters)"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="caseType-label">Case Type</InputLabel>
              <Select
                labelId="caseType-label"
                id="caseType"
                name="caseType"
                value={formData.caseType}
                label="Case Type"
                onChange={handleChange as any}
              >
                <MenuItem value="asylum">Asylum/Refugee</MenuItem>
                <MenuItem value="torture">Torture</MenuItem>
                <MenuItem value="arbitrary_detention">Arbitrary Detention</MenuItem>
                <MenuItem value="disappearance">Forced Disappearance</MenuItem>
                <MenuItem value="discrimination">Discrimination</MenuItem>
                <MenuItem value="freedom_expression">Freedom of Expression</MenuItem>
                <MenuItem value="other">Other Human Rights Violation</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="urgency-label">Urgency Level</InputLabel>
              <Select
                labelId="urgency-label"
                id="urgency"
                name="urgency"
                value={formData.urgency}
                label="Urgency Level"
                onChange={handleChange as any}
              >
                <MenuItem value="low">Low - No immediate danger</MenuItem>
                <MenuItem value="medium">Medium - Concerning situation</MenuItem>
                <MenuItem value="high">High - Urgent attention needed</MenuItem>
                <MenuItem value="critical">Critical - Immediate danger</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Location information helps us match you with lawyers who can assist in your jurisdiction.
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="country"
              label="Country"
              name="location.country"
              value={formData.location.country}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              fullWidth
              id="city"
              label="City"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              fullWidth
              id="region"
              label="Region/State"
              name="location.region"
              value={formData.location.region}
              onChange={handleChange}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.anonymous}
                  onChange={handleChange}
                  name="anonymous"
                  color="primary"
                />
              }
              label="Submit this case anonymously"
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Submission
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Title</Typography>
              <Typography variant="body1" gutterBottom>{formData.title}</Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Description</Typography>
              <Typography variant="body2" gutterBottom>{formData.description}</Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Case Type</Typography>
              <Typography variant="body1" gutterBottom>{formData.caseType}</Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Urgency</Typography>
              <Typography variant="body1" gutterBottom>{formData.urgency}</Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Location</Typography>
              <Typography variant="body1">
                {formData.location.city && `${formData.location.city}, `}
                {formData.location.region && `${formData.location.region}, `}
                {formData.location.country}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Anonymous</Typography>
              <Typography variant="body1">{formData.anonymous ? 'Yes' : 'No'}</Typography>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Case submitted successfully! Your case is being reviewed and you'll be matched with a lawyer soon.
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Submit New Case
          </Typography>

          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }} disabled={loading}>
                Back
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || success}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Case'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!formData.title || !formData.description || !formData.caseType)) ||
                  (activeStep === 1 && !formData.location.country)
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CaseSubmissionForm;
