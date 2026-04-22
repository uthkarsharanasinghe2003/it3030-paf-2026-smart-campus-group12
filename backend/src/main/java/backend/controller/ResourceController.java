package backend.controller;

import backend.exception.ResourceNotFoundException;
import backend.model.Resource;
import backend.repository.ResourceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceRepository.save(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @RequestBody Resource updatedResource) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        resource.setName(updatedResource.getName());
        resource.setType(updatedResource.getType());
        resource.setCapacity(updatedResource.getCapacity());
        resource.setLocation(updatedResource.getLocation());
        resource.setAvailability(updatedResource.getAvailability());
        resource.setStatus(updatedResource.getStatus());
        resource.setDescription(updatedResource.getDescription());
        resource.setImage(updatedResource.getImage());
        resource.setEquipment(updatedResource.getEquipment());
        resource.setSlot1(updatedResource.getSlot1());
        resource.setSlot2(updatedResource.getSlot2());
        resource.setSlot3(updatedResource.getSlot3());

        return resourceRepository.save(resource);
    }

    @DeleteMapping("/{id}")
    public String deleteResource(@PathVariable Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        resourceRepository.delete(resource);
        return "Resource deleted successfully";
    }
}