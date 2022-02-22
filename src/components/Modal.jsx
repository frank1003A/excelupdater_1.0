import { Modal, Box, Typography } from '@mui/material'

const Modals = ({children, OpenModal, handleCloseModal}) => {

    /**modal */
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "white",
    boxShadow: 24,
    padding: "1rem",
    borderColor: 'none',
    p: 4,
    overflow: 'hidden',
    //maxWidth: '600px',
    borderRadius: '8px'
  };
  /**modal end */

  return (
    <div>
        <Modal
              open={OpenModal}
              onClose={handleCloseModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  {children}
                </Typography>
              </Box>
            </Modal>
    </div>
  )
}

export default Modals