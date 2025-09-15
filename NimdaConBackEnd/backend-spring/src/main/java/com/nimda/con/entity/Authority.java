package com.nimda.con.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "authority")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Authority {
    
    @Id
    @Column(name = "authority_name", length = 50)
    private String authorityName;
}
