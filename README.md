
# References
## Land Claim addon by @shadowgamer100k

outline breakdown about all the logics in this addon

### main.js file

__1. itemUse lock item__

    - when not sneaking, showing main menu

__2. interactWithBlock with lock item__

    - when sneaking, coordinates selection

__3. main menu gui (ActionFormData)__

    - create area (4.)
    - all area (5.)
    - give access (6.)
    - delete area (7.)
    - admin panel (8.) [if admin]
    
__4. area creation form (ModalFormData)__

    - area name
    - coordinates from
    - coordinates to 

__5. all areas gui (ActionFormData)__

    - area list item
        - whitelisted players
        - messages about area
        - close gui

__6. give access gui (ModalFormData)__

    - dropdown areas
    - dropdown players

__7. delete area gui (ActionFormData)__

    - button delete using key (MessageFormData)
        - key text field
    - button delete using form (ModalFormData)
        - dropdown areas
    - button cancel, return to (3.)

__8. admin panel gui (ActionFormData)__

    - find area by key (ModalFormData)
        - input key to show details
    - set area limit (ModalFormData)
        - show and set limit
    - all area
        - list button of all area
            - area owner
            - area name
            - area from
            - area to
            - area surface
            - area key
            - area dimension
            - area date
            - button to delete
            - button to teleport
            - button to give message
    - clear all area (MessageeFormData)
        - button to confirm
        - button to cancel
    - close gui

__9. calculate area surface function__

__10. add message to area function__

__11. generate id function__

### ProtectedAreaHandler.js file

#### Class: ProtectedAreas
- Constructor
- GET methods
  - getProtectedAreas
  - getArea
  - getAreaWhitelist
  - getAllAreaKeys
  - getAdmins
- SET methods
  - areaWhitelistAdd
  - addAdmin
  - setArea
- UPDATE methods
  - update
  - updateAdmins
  - updateAreaWhitelist
- DELETE methods
  - deleteArea
  - deleteAreaByKey
  - deleteAllAreas
  - clearAreaWhitelist
  - removeAdmin
  - removeAllAdmins
  - areaWhitelistRemove

#### Class: Area
- Constructor

#### Class: AreaUtils
- Static methods
  - isInside
  - getAreaFromBlockLocation
  - intersects

#### Event handlers
- playerPlaceBlock
- playerInteractWithBlock
- playerBreakBlock
- explosion

#### Interval function
- Player location checking
- Area information display
- Key saving mechanism
