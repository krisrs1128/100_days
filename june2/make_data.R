
library("ape")
library("plyr")
library("tidyverse")
library("proxy")
library("phyloseq")
library("dendextend")
theme_set(ggscaffold::min_theme(list(
                        "legend_position" = "right",
                        "border_size" = 0.2
                      ))
          )

## --- utils ----
melted_counts <- function(x) {
  x %>% data.frame() %>%
    rownames_to_column("sample") %>%
    as_data_frame %>%
    gather(key = "rsv", value = "value", -sample) %>%
    mutate(
      scaled = asinh(value) / nrow(x),
      present = ifelse(value > 0, 1, 0)
    )
}

taxa_labels <- function(taxa) {
  taxa <- taxa %>%
    data.frame() %>%
    rownames_to_column("rsv")
  taxa$label <- taxa$Taxon_5
  taxa$label[is.na(taxa$Taxon_5)] <- taxa$Taxon_4[is.na(taxa$Taxon_5)]
  ordered_labels <- names(sort(table(taxa$label), decreasing = TRUE))
  taxa_levels <- c(ordered_labels, "other")
  taxa$label <- factor(taxa$label, taxa_levels)
  taxa$label[!c(taxa$label %in% ordered_labels[1:6])] <- "other"
  taxa$label[taxa$label == ""] <- "other"
  taxa
}

join_sources <- function(x, taxa, samples, dendro, h = 0.5) {
  leaf_ix <- order.dendrogram(dendro)
  leaf_order <- labels(dendro)[leaf_ix]
  cluster <- data.frame("cluster" = cutree(dendro, h = h)) %>%
    rownames_to_column(var = "rsv")

  cluster <- cluster %>%
    left_join(data_frame(rsv = leaf_order, leaf_ix = leaf_ix)) %>%
    arrange(leaf_ix)
  cluster$cluster <- factor(cluster$cluster, levels = unique(cluster$cluster))

  mx <- melted_counts(x) %>%
    left_join(taxa) %>%
    left_join(samples) %>%
    left_join(cluster)

  mx %>%
    group_by(sample, cluster) %>%
    mutate(centroid_prob = mean(present)) %>%
    group_by(sample, cluster, present) %>%
    mutate(centroid = mean(scaled))
}


## ---- data ----
download.file("https://github.com/krisrs1128/treelapse/raw/master/data/abt.rda", "abt.rda")
abt <- get(load("abt.rda")) %>%
  filter_taxa(function(x) { var(x) > 5 }, TRUE)

x <- t(get_taxa(abt))

## ---- pos-bin ----
## separate into conditional positive and present absence data
x_bin <- x > 0
class(x_bin) <- "numeric"

x_pos <- x
x_pos[x_pos == 0] <- NA

## ---- distances ----
D_jaccard <- dist(t(x_bin), method = "jaccard")
jaccard_tree <- hclust(D_jaccard)
plot(jaccard_tree)

x_scaled <- asinh(x) / nrow(x)

D_euclidean <- dist(t(x_scaled), method = "euclidean")
euclidean_tree <- hclust(D_euclidean)
plot(euclidean_tree)

alpha <- 0.5
D_mix <- alpha * D_jaccard + (1 - alpha) * D_euclidean
mix_tree <- hclust(D_mix)
plot(mix_tree)

## ---- join-sources ----
samples <- sample_data(abt) %>%
  data.frame() %>%
  rownames_to_column("sample")
taxa <- abt %>%
  tax_table %>%
  taxa_labels

mix_dendro <- reorder(as.dendrogram(mix_tree), -colMeans(x))
mx <- join_sources(x, taxa, samples, mix_dendro, h = 0)

## ---- write-js ---
phy <- as.phylo(mix_dendro)
plot(phy)
phy_data <- get("last_plot.phylo", envir = .PlotPhyloEnv)

node_data <- data_frame(
  id = seq_along(phy_data$xx),
  y = -phy_data$xx,
  x = phy_data$yy
)

phy_df <- as_data_frame(phy$edge) %>%
  rename(parent = V1, id = V2) %>%
  left_join(node_data)
mapping <- setNames(phy$tip, seq_along(phy$tip))
phy_df <- rbind(
  phy_df,
  data_frame(parent = "", id = phy$edge[1, 1], y = 0.03, x = mean(phy_df$x))
) %>%
  mutate(
    id = revalue(as.character(id), mapping)
  )

cat(sprintf("var tree = %s;", jsonlite::toJSON(phy_df)), file = "~/Desktop/100_days/june2/tree.js")

js_data <- mx %>%
  ungroup() %>%
  arrange(leaf_ix) %>%
  dplyr::select(sample, rsv, label, scaled) %>%
  rename(
    column = rsv,
    row = sample,
    value = scaled
  ) %>%
  left_join(
    phy_df %>%
    rename(column = id) %>%
    select(-y, -parent)
  )

cat(sprintf("var data = %s;", jsonlite::toJSON(js_data)), file = "~/Desktop/100_days/june2/data.js")

ts_data <- js_data %>%
  dlply(.(column, label), function(z) {
    data.frame(row = z$row, value = z$value, column = z$column[1])
  })
names(ts_data) <- NULL
cat(sprintf("var ts_data = %s;", jsonlite::toJSON(ts_data)), file = "~/Desktop/100_days/june2/ts_data.js")
