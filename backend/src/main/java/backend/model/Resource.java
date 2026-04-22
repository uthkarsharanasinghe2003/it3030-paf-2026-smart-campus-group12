package backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String availability;
    private String status;
    private String description;
    private String image;
    private String equipment;
    private String slot1;
    private String slot2;
    private String slot3;

    public Resource() {
    }

    public Resource(Long id, String name, String type, Integer capacity, String location,
                    String availability, String status, String description,
                    String image, String equipment,
                    String slot1, String slot2, String slot3) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availability = availability;
        this.status = status;
        this.description = description;
        this.image = image;
        this.equipment = equipment;
        this.slot1 = slot1;
        this.slot2 = slot2;
        this.slot3 = slot3;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public String getAvailability() {
        return availability;
    }

    public String getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public String getImage() {
        return image;
    }

    public String getEquipment() {
        return equipment;
    }

    public String getSlot1() {
        return slot1;
    }

    public String getSlot2() {
        return slot2;
    }

    public String getSlot3() {
        return slot3;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public void setSlot1(String slot1) {
        this.slot1 = slot1;
    }

    public void setSlot2(String slot2) {
        this.slot2 = slot2;
    }

    public void setSlot3(String slot3) {
        this.slot3 = slot3;
    }
}