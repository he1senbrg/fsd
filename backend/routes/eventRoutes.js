const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createEventValidator } = require('../validators/eventValidators');

router.get('/', ctrl.getEvents);
router.get('/upcoming', ctrl.getUpcomingEvents);
router.get('/:id', ctrl.getEvent);
router.post('/', authenticate, createEventValidator, validate, ctrl.createEvent);
router.put('/:id', authenticate, ctrl.updateEvent);
router.delete('/:id', authenticate, ctrl.deleteEvent);
router.post('/:id/publish', authenticate, ctrl.publishEvent);
router.post('/:id/book', authenticate, ctrl.bookTicket);
router.post('/:id/rsvp', authenticate, ctrl.rsvpEvent);
router.get('/:id/attendees', authenticate, ctrl.getAttendees);

module.exports = router;