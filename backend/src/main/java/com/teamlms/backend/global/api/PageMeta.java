package com.teamlms.backend.global.api;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class PageMeta {
    private int page; // 1-based
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrev;
    private List<String> sort;

    public static PageMeta from(Page<?> p) {
        return PageMeta.builder()
                .page(p.getNumber() + 1)
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .hasNext(p.hasNext())
                .hasPrev(p.hasPrevious())
                .sort(p.getSort().stream()
                        .map(o -> o.getProperty() + "," + o.getDirection().name().toLowerCase())
                        .collect(Collectors.toList()))
                .build();
    }
}
