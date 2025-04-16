;; Equipment Registration Contract
;; Records details of elevator systems

(define-data-var last-elevator-id uint u0)

;; Define elevator data structure
(define-map elevators
  { elevator-id: uint }
  {
    building-address: (string-utf8 256),
    model: (string-utf8 100),
    manufacturer: (string-utf8 100),
    installation-date: uint,
    capacity: uint,
    floors-serviced: (list 50 uint),
    last-maintenance: uint,
    owner: principal
  }
)

;; Register a new elevator
(define-public (register-elevator
                (building-address (string-utf8 256))
                (model (string-utf8 100))
                (manufacturer (string-utf8 100))
                (installation-date uint)
                (capacity uint)
                (floors-serviced (list 50 uint)))
  (let ((new-id (+ (var-get last-elevator-id) u1)))
    (asserts! (is-eq tx-sender contract-caller) (err u403))
    (var-set last-elevator-id new-id)
    (map-set elevators
      { elevator-id: new-id }
      {
        building-address: building-address,
        model: model,
        manufacturer: manufacturer,
        installation-date: installation-date,
        capacity: capacity,
        floors-serviced: floors-serviced,
        last-maintenance: u0,
        owner: tx-sender
      }
    )
    (ok new-id)
  )
)

;; Update elevator maintenance date
(define-public (update-maintenance (elevator-id uint) (maintenance-date uint))
  (let ((elevator-data (unwrap! (map-get? elevators { elevator-id: elevator-id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner elevator-data)) (err u403))
    (map-set elevators
      { elevator-id: elevator-id }
      (merge elevator-data { last-maintenance: maintenance-date })
    )
    (ok true)
  )
)

;; Get elevator details
(define-read-only (get-elevator (elevator-id uint))
  (map-get? elevators { elevator-id: elevator-id })
)

;; Get total number of registered elevators
(define-read-only (get-elevator-count)
  (var-get last-elevator-id)
)
